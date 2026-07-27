import { NextResponse } from 'next/server';

import { getSaasApiContext, saasApiErrorResponse } from '@/server/saas/api';
import { updateSaasProjectTaskStatus } from '@/server/saas/project-tasks';
import { updateProjectTaskStatusSchema } from '@/server/saas/validation';

export const runtime = 'nodejs';

type TaskRouteContext = Readonly<{
  readonly params: Promise<Readonly<{ readonly id: string; readonly taskId: string }>>;
}>;

export async function PATCH(
  request: Request,
  routeContext: TaskRouteContext,
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

  const parsed = updateProjectTaskStatusSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ message: '任务状态不正确。' }, { status: 400 });
  }

  const { id, taskId } = await routeContext.params;

  try {
    await updateSaasProjectTaskStatus(contextResult.context, {
      projectId: id,
      status: parsed.data.status,
      taskId,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return saasApiErrorResponse(error);
  }
}
