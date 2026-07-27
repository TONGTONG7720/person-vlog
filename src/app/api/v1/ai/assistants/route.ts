import { NextResponse } from 'next/server';

import { getSaasApiContext, saasApiErrorResponse } from '@/server/saas/api';
import { createSaasAiAssistant, getSaasAiPlatformOverview } from '@/server/saas/ai-workspaces';
import { createAiAssistantRequestSchema } from '@/server/saas/validation';

export const runtime = 'nodejs';

export async function GET(request: Request): Promise<NextResponse> {
  const contextResult = await getSaasApiContext(request);

  if (contextResult.kind === 'unauthorized') {
    return contextResult.response;
  }

  try {
    const overview = await getSaasAiPlatformOverview(contextResult.context);
    const assistants = overview.workspaces.flatMap((workspace) => workspace.assistants);

    return NextResponse.json({ assistants, templates: overview.templates });
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

  const parsed = createAiAssistantRequestSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ message: 'AI 助手配置不正确。' }, { status: 400 });
  }

  try {
    const assistant = await createSaasAiAssistant(contextResult.context, parsed.data);

    return NextResponse.json({ assistant }, { status: 201 });
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
