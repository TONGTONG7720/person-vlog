import { NextResponse } from 'next/server';

import { getSaasApiContext, saasApiErrorResponse } from '@/server/saas/api';
import { createSaasWorkspaceProject, getSaasPortalProjects } from '@/server/saas/projects';
import { createWorkspaceProjectSchema } from '@/server/saas/validation';

export const runtime = 'nodejs';

export async function GET(request: Request): Promise<NextResponse> {
  const contextResult = await getSaasApiContext(request);

  if (contextResult.kind === 'unauthorized') {
    return contextResult.response;
  }

  const projects = await getSaasPortalProjects(contextResult.context);

  return NextResponse.json({ projects });
}

export async function POST(request: Request): Promise<NextResponse> {
  const contextResult = await getSaasApiContext(request);

  if (contextResult.kind === 'unauthorized') {
    return contextResult.response;
  }

  let payload: unknown;

  try {
    payload = await request.json();
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json({ message: '请求内容无法读取。' }, { status: 400 });
    }

    throw error;
  }

  const parsed = createWorkspaceProjectSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ message: '项目资料不完整。' }, { status: 400 });
  }

  try {
    const project = await createSaasWorkspaceProject(contextResult.context, parsed.data);

    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    return saasApiErrorResponse(error);
  }
}
