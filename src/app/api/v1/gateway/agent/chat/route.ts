import { NextResponse } from 'next/server';

import { openEnterpriseGatewayRequest } from '@/server/enterprise/gateway-service';
import { authenticateAiApiKey } from '@/server/saas/ai-api-keys';
import { createAiChatResponse } from '@/server/saas/ai-chat';
import { saasApiErrorResponse } from '@/server/saas/api';
import { requireOrganizationPlanFeature } from '@/server/saas/billing/entitlements';
import { AiApiAuthenticationError } from '@/server/saas/ai-platform-errors';
import { aiChatRequestSchema } from '@/server/saas/validation';

const textEncoder = new TextEncoder();

export const runtime = 'nodejs';

export async function POST(request: Request): Promise<Response> {
  const payload = await readJson(request);
  const parsed = aiChatRequestSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ message: 'AI 助手或问题内容不正确。' }, { status: 400 });
  }

  let release: (() => void) | undefined;

  try {
    const identity = await authenticateAiApiKey(request);

    if (identity === undefined) {
      throw new AiApiAuthenticationError();
    }

    const lease = openEnterpriseGatewayRequest(identity, 'agent.execute');
    release = lease.release;
    await requireOrganizationPlanFeature(identity.organizationId, 'apiAccess');
    const response = await createAiChatResponse({
      assistantId: parsed.data.assistantId,
      channel: 'API',
      enterpriseId: identity.enterpriseId,
      message: parsed.data.message,
      organizationId: identity.organizationId,
      role: undefined,
    });

    const stream = createEventStream(response.stream, lease.release);
    release = undefined;

    return new Response(stream, {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
        Connection: 'keep-alive',
        'Content-Type': 'text/event-stream; charset=utf-8',
        'X-Enterprise-RateLimit-Remaining': String(lease.rateLimit.remaining),
        'X-Enterprise-RateLimit-Reset': String(lease.rateLimit.resetAt),
      },
    });
  } catch (error) {
    release?.();
    return saasApiErrorResponse(error);
  }
}

function createEventStream(
  source: ReadableStream<string>,
  release: () => void,
): ReadableStream<Uint8Array> {
  return new ReadableStream<Uint8Array>({
    async start(controller) {
      const reader = source.getReader();

      try {
        for (;;) {
          const result = await reader.read();

          if (result.done) {
            break;
          }

          controller.enqueue(
            textEncoder.encode(
              `event: token\ndata: ${JSON.stringify({ value: result.value })}\n\n`,
            ),
          );
        }

        controller.enqueue(textEncoder.encode('event: done\ndata: {}\n\n'));
        controller.close();
      } catch (error) {
        controller.error(error);
      } finally {
        reader.releaseLock();
        release();
      }
    },
  });
}

async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return undefined;
  }
}
