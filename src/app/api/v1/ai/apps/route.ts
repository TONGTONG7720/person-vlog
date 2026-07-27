import { NextResponse } from 'next/server';

import { getSaasApiContext, saasApiErrorResponse } from '@/server/saas/api';
import { createAiNativeApp, getAiNativeAppOverview } from '@/server/saas/ai-native-apps';
import { createAiNativeAppRequestSchema } from '@/server/saas/ai-native-app-validation';

export const runtime = 'nodejs';

export async function GET(request: Request): Promise<NextResponse> {
  const contextResult = await getSaasApiContext(request);

  if (contextResult.kind === 'unauthorized') {
    return contextResult.response;
  }

  try {
    const overview = await getAiNativeAppOverview(contextResult.context);

    return NextResponse.json({ overview });
  } catch (error) {
    return saasApiErrorResponse(error);
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  const contextResult = await getSaasApiContext(request);

  if (contextResult.kind === 'unauthorized') {
    return contextResult.response;
  }

  const payload = await readJson(request);

  if (payload === undefined) {
    return NextResponse.json({ message: '请求内容无法读取。' }, { status: 400 });
  }

  const parsed = createAiNativeAppRequestSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ message: 'AI 应用配置不正确。' }, { status: 400 });
  }

  try {
    const app = await createAiNativeApp(contextResult.context, parsed.data);

    return NextResponse.json({ app }, { status: 201 });
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
