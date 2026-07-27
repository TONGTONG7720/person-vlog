import { NextResponse } from 'next/server';

import { authorizeEnterpriseGatewayRequest } from '@/server/enterprise/gateway-service';
import { getSaasApiContext, saasApiErrorResponse } from '@/server/saas/api';
import { authenticateAiApiKey } from '@/server/saas/ai-api-keys';
import { createAiChatResponse } from '@/server/saas/ai-chat';
import { requireSaasPermission, type SaasContext } from '@/server/saas/auth';
import {
  requireOrganizationPlanFeature,
  requirePlanFeature,
} from '@/server/saas/billing/entitlements';
import { AiApiAuthenticationError } from '@/server/saas/ai-platform-errors';
import { saasPermissions } from '@/server/saas/rbac';
import { aiChatRequestSchema } from '@/server/saas/validation';

const textEncoder = new TextEncoder();

export const runtime = 'nodejs';

export async function POST(request: Request): Promise<Response> {
  const payload = await readJson(request);

  if (payload === undefined) {
    return NextResponse.json({ message: '请求内容无法读取。' }, { status: 400 });
  }

  const parsed = aiChatRequestSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ message: 'AI 助手或问题内容不正确。' }, { status: 400 });
  }

  const sessionContext = await getSaasApiContext(request);

  try {
    const response =
      sessionContext.kind === 'authorized'
        ? await createDashboardAiChat(sessionContext.context, parsed.data)
        : await createApiKeyAiChat(request, parsed.data);

    return new Response(createAiChatEventStream(response.stream, response.sources), {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
        Connection: 'keep-alive',
        'Content-Type': 'text/event-stream; charset=utf-8',
        'X-Accel-Buffering': 'no',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error) {
    return saasApiErrorResponse(error);
  }
}

async function createDashboardAiChat(
  context: SaasContext,
  payload: Readonly<{ readonly assistantId: string; readonly message: string }>,
) {
  requireSaasPermission(context, saasPermissions.aiUse);
  await requirePlanFeature(context, 'aiWorkspace');

  return createAiChatResponse({
    assistantId: payload.assistantId,
    channel: 'DASHBOARD',
    enterpriseId: context.enterprise.id,
    message: payload.message,
    organizationId: context.organization.id,
    role: context.membership.role,
  });
}

async function createApiKeyAiChat(
  request: Request,
  payload: Readonly<{ readonly assistantId: string; readonly message: string }>,
) {
  const apiKey = await authenticateAiApiKey(request);

  if (apiKey === undefined) {
    throw new AiApiAuthenticationError();
  }

  authorizeEnterpriseGatewayRequest(apiKey, 'agent.execute');

  await requireOrganizationPlanFeature(apiKey.organizationId, 'apiAccess');

  return createAiChatResponse({
    assistantId: payload.assistantId,
    channel: 'API',
    enterpriseId: apiKey.enterpriseId,
    message: payload.message,
    organizationId: apiKey.organizationId,
    role: undefined,
  });
}

function createAiChatEventStream(
  source: ReadableStream<string>,
  sources: readonly Readonly<{
    readonly chunkIndex: number;
    readonly documentId: string;
    readonly title: string;
  }>[],
): ReadableStream<Uint8Array> {
  return new ReadableStream<Uint8Array>({
    async start(controller) {
      const reader = source.getReader();
      let answer = '';

      try {
        for (;;) {
          const result = await reader.read();

          if (result.done) {
            break;
          }

          answer += result.value;
          controller.enqueue(encodeEvent('token', { value: result.value }));
        }

        controller.enqueue(encodeEvent('sources', { sources }));
        controller.enqueue(encodeEvent('done', { answer, sources }));
        controller.close();
      } catch {
        controller.enqueue(encodeEvent('error', { message: 'AI 回复中断，请稍后重试。' }));
        controller.close();
      } finally {
        reader.releaseLock();
      }
    },
  });
}

function encodeEvent(event: string, payload: unknown): Uint8Array {
  return textEncoder.encode(`event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`);
}

async function readJson(request: Request): Promise<unknown | undefined> {
  try {
    return await request.json();
  } catch (error) {
    return error instanceof SyntaxError ? undefined : Promise.reject(error);
  }
}
