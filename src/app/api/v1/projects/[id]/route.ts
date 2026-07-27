import { NextResponse } from 'next/server';

import { getSaasApiContext } from '@/server/saas/api';
import { getSaasProjectWorkspace } from '@/server/saas/projects';

export const runtime = 'nodejs';

type ProjectRouteContext = Readonly<{
  readonly params: Promise<Readonly<{ readonly id: string }>>;
}>;

export async function GET(
  request: Request,
  routeContext: ProjectRouteContext,
): Promise<NextResponse> {
  const contextResult = await getSaasApiContext(request);

  if (contextResult.kind === 'unauthorized') {
    return contextResult.response;
  }

  const { id } = await routeContext.params;
  const project = await getSaasProjectWorkspace(contextResult.context, id);

  return project === null
    ? NextResponse.json({ message: '当前企业空间中不存在该项目。' }, { status: 404 })
    : NextResponse.json({ project });
}
