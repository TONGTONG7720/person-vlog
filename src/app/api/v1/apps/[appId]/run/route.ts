import { NextResponse } from 'next/server';

import { authorizeEnterpriseGatewayRequest } from '@/server/enterprise/gateway-service';
import { createAiAppChatEventStream } from '@/server/saas/ai-event-stream';
import { authenticateAiApiKey } from '@/server/saas/ai-api-keys';
import { createApiKeyAiNativeAppResponse } from '@/server/saas/ai-native-apps';
import {
  aiNativeAppIdSchema,
  aiNativeAppSandboxRequestSchema,
} from '@/server/saas/ai-native-app-validation';
import { requireOrganizationPlanFeature } from '@/server/saas/billing/entitlements';
import { AiApiAuthenticationError } from '@/server/saas/ai-platform-errors';
import { saasApiErrorResponse } from '@/server/saas/api';

export const runtime = 'nodejs';

type AiNativeAppRunRouteProps = Readonly<{
  readonly params: Promise<Readonly<{ readonly appId: string }>>;
}>;

export async function POST(
  request: Request,
  { params }: AiNativeAppRunRouteProps,
): Promise<Response> {
  const [route, payload] = await Promise.all([params, readJson(request)]);
  const [parsedAppId, parsedPayload] = [
    aiNativeAppIdSchema.safeParse(route.appId),
    aiNativeAppSandboxRequestSchema.safeParse(payload),
  ];

  if (!parsedAppId.success || !parsedPayload.success) {
    return NextResponse.json({ message: 'AI 应用调用请求不正确。' }, { status: 400 });
  }

  try {
    const apiKey = await authenticateAiApiKey(request);

    if (apiKey === undefined) {
      throw new AiApiAuthenticationError();
    }

    authorizeEnterpriseGatewayRequest(apiKey, 'agent.execute');
    await requireOrganizationPlanFeature(apiKey.organizationId, 'apiAccess');
    const response = await createApiKeyAiNativeAppResponse({
      appId: parsedAppId.data,
      enterpriseId: apiKey.enterpriseId,
      message: parsedPayload.data.message,
      organizationId: apiKey.organizationId,
    });

    return new Response(createAiAppChatEventStream(response), { headers: streamHeaders });
  } catch (error) {
    return saasApiErrorResponse(error);
  }
}

const streamHeaders = {
  'Cache-Control': 'no-store, max-age=0',
  Connection: 'keep-alive',
  'Content-Type': 'text/event-stream; charset=utf-8',
  'X-Accel-Buffering': 'no',
  'X-Content-Type-Options': 'nosniff',
} as const;

async function readJson(request: Request): Promise<unknown | undefined> {
  try {
    return await request.json();
  } catch (error) {
    return error instanceof SyntaxError ? undefined : Promise.reject(error);
  }
}
