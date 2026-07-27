import { NextResponse } from 'next/server';

import { getSaasApiContext, saasApiErrorResponse } from '@/server/saas/api';
import { getAiNativeAppForBuilder, updateAiNativeApp } from '@/server/saas/ai-native-apps';
import {
  aiNativeAppIdSchema,
  updateAiNativeAppRequestSchema,
} from '@/server/saas/ai-native-app-validation';

export const runtime = 'nodejs';

type AiNativeAppRouteProps = Readonly<{
  readonly params: Promise<Readonly<{ readonly appId: string }>>;
}>;

export async function GET(
  request: Request,
  { params }: AiNativeAppRouteProps,
): Promise<NextResponse> {
  const [contextResult, route] = await Promise.all([getSaasApiContext(request), params]);

  if (contextResult.kind === 'unauthorized') {
    return contextResult.response;
  }

  const parsedAppId = aiNativeAppIdSchema.safeParse(route.appId);

  if (!parsedAppId.success) {
    return NextResponse.json({ message: 'AI 应用标识不正确。' }, { status: 400 });
  }

  try {
    const app = await getAiNativeAppForBuilder(contextResult.context, parsedAppId.data);

    return app === null
      ? NextResponse.json({ message: '当前企业空间中不存在该资源。' }, { status: 404 })
      : NextResponse.json({ app });
  } catch (error) {
    return saasApiErrorResponse(error);
  }
}

export async function PATCH(
  request: Request,
  { params }: AiNativeAppRouteProps,
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
    return NextResponse.json({ message: 'AI 应用更新请求不正确。' }, { status: 400 });
  }

  const parsed = updateAiNativeAppRequestSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ message: 'AI 应用更新配置不正确。' }, { status: 400 });
  }

  try {
    const app = await updateAiNativeApp(contextResult.context, parsedAppId.data, parsed.data);

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
