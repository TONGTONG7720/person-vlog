import { NextResponse } from 'next/server';

import { getSaasApiContext, saasApiErrorResponse } from '@/server/saas/api';
import { createSaasWorkspace } from '@/server/saas/projects';
import { createWorkspaceRequestSchema } from '@/server/saas/validation';

export const runtime = 'nodejs';

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

  const parsed = createWorkspaceRequestSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ message: '工作区名称或标识不正确。' }, { status: 400 });
  }

  try {
    const workspace = await createSaasWorkspace(contextResult.context, parsed.data);

    return NextResponse.json({ workspace }, { status: 201 });
  } catch (error) {
    return saasApiErrorResponse(error);
  }
}
