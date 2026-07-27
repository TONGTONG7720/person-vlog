import { NextResponse } from 'next/server';

import { getSaasApiContext, saasApiErrorResponse } from '@/server/saas/api';
import { createSaasAiWorkspace, getSaasAiPlatformOverview } from '@/server/saas/ai-workspaces';
import { createAiWorkspaceRequestSchema } from '@/server/saas/validation';

export const runtime = 'nodejs';

export async function GET(request: Request): Promise<NextResponse> {
  const contextResult = await getSaasApiContext(request);

  if (contextResult.kind === 'unauthorized') {
    return contextResult.response;
  }

  try {
    const overview = await getSaasAiPlatformOverview(contextResult.context);

    return NextResponse.json({ templates: overview.templates, workspaces: overview.workspaces });
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

  const parsed = createAiWorkspaceRequestSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ message: 'AI Workspace 名称或标识不正确。' }, { status: 400 });
  }

  try {
    const workspace = await createSaasAiWorkspace(contextResult.context, parsed.data);

    return NextResponse.json({ workspace }, { status: 201 });
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
