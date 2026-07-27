import { NextResponse } from 'next/server';

import { getSaasApiContext, saasApiErrorResponse } from '@/server/saas/api';
import { transitionAiNativeAppLifecycle } from '@/server/saas/ai-native-apps';
import {
  aiNativeAppIdSchema,
  aiNativeAppLifecycleRequestSchema,
} from '@/server/saas/ai-native-app-validation';

export const runtime = 'nodejs';

type AiNativeAppLifecycleRouteProps = Readonly<{
  readonly params: Promise<Readonly<{ readonly appId: string }>>;
}>;

export async function POST(
  request: Request,
  { params }: AiNativeAppLifecycleRouteProps,
): Promise<NextResponse> {
  const [contextResult, route] = await Promise.all([getSaasApiContext(request), params]);

  if (contextResult.kind === 'unauthorized') {
    return contextResult.response;
  }

  const [parsedAppId, payload] = [
    aiNativeAppIdSchema.safeParse(route.appId),
    await readJson(request),
  ];

  if (!parsedAppId.success || payload === undefined) {
    return NextResponse.json({ message: 'AI 应用生命周期请求不正确。' }, { status: 400 });
  }

  const parsed = aiNativeAppLifecycleRequestSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ message: 'AI 应用生命周期动作不正确。' }, { status: 400 });
  }

  try {
    const app = await transitionAiNativeAppLifecycle(
      contextResult.context,
      parsedAppId.data,
      parsed.data,
    );

    return NextResponse.json({ app });
  } catch (error) {
    return saasApiErrorResponse(error);
  }
}

async function readJson(request: Request): Promise<unknown | undefined> {
  try {
    return await request.json();
  } catch (error) {
    return error instanceof SyntaxError ? undefined : Promise.reject(error);
  }
}
