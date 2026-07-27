import { NextResponse } from 'next/server';

import { getSaasApiContext, saasApiErrorResponse } from '@/server/saas/api';
import { createSaasProjectTask } from '@/server/saas/project-tasks';
import { createProjectTaskRequestSchema } from '@/server/saas/validation';

export const runtime = 'nodejs';

type ProjectRouteContext = Readonly<{
  readonly params: Promise<Readonly<{ readonly id: string }>>;
}>;

export async function POST(
  request: Request,
  routeContext: ProjectRouteContext,
): Promise<NextResponse> {
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

  const parsed = createProjectTaskRequestSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ message: '任务资料不完整。' }, { status: 400 });
  }

  const { id } = await routeContext.params;

  try {
    const task = await createSaasProjectTask(contextResult.context, id, parsed.data);

    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    return saasApiErrorResponse(error);
  }
}
