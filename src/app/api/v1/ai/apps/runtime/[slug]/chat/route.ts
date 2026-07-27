import { NextResponse } from 'next/server';

import { createAiAppChatEventStream } from '@/server/saas/ai-event-stream';
import { getSaasApiContext, saasApiErrorResponse } from '@/server/saas/api';
import { createPublishedAiNativeAppResponse } from '@/server/saas/ai-native-apps';
import { aiNativeAppSandboxRequestSchema } from '@/server/saas/ai-native-app-validation';

export const runtime = 'nodejs';

type AiNativeAppRuntimeRouteProps = Readonly<{
  readonly params: Promise<Readonly<{ readonly slug: string }>>;
}>;

export async function POST(
  request: Request,
  { params }: AiNativeAppRuntimeRouteProps,
): Promise<Response> {
  const [contextResult, route] = await Promise.all([getSaasApiContext(request), params]);

  if (contextResult.kind === 'unauthorized') {
    return contextResult.response;
  }

  const payload = await readJson(request);

  if (payload === undefined || route.slug.trim() === '') {
    return NextResponse.json({ message: 'AI 应用对话请求不正确。' }, { status: 400 });
  }

  const parsed = aiNativeAppSandboxRequestSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ message: 'AI 应用对话消息不正确。' }, { status: 400 });
  }

  try {
    const response = await createPublishedAiNativeAppResponse(
      contextResult.context,
      route.slug,
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
