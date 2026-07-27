import { NextResponse } from 'next/server';

import { createAiAppChatEventStream } from '@/server/saas/ai-event-stream';
import { getSaasApiContext, saasApiErrorResponse } from '@/server/saas/api';
import { createAiNativeAppSandboxResponse } from '@/server/saas/ai-native-apps';
import {
  aiNativeAppIdSchema,
  aiNativeAppSandboxRequestSchema,
} from '@/server/saas/ai-native-app-validation';

export const runtime = 'nodejs';

type AiNativeAppSandboxRouteProps = Readonly<{
  readonly params: Promise<Readonly<{ readonly appId: string }>>;
}>;

export async function POST(
  request: Request,
  { params }: AiNativeAppSandboxRouteProps,
): Promise<Response> {
  const [contextResult, route] = await Promise.all([getSaasApiContext(request), params]);

  if (contextResult.kind === 'unauthorized') {
    return contextResult.response;
  }

  const [parsedAppId, payload] = [
    aiNativeAppIdSchema.safeParse(route.appId),
    await readJson(request),
  ];

  if (!parsedAppId.success || payload === undefined) {
    return NextResponse.json({ message: 'Sandbox 测试请求不正确。' }, { status: 400 });
  }

  const parsed = aiNativeAppSandboxRequestSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ message: 'Sandbox 测试消息不正确。' }, { status: 400 });
  }

  try {
    const response = await createAiNativeAppSandboxResponse(
      contextResult.context,
      parsedAppId.data,
      parsed.data.message,
    );

    return new Response(createAiAppChatEventStream(response), {
      headers: streamHeaders,
    });
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
