import { NextResponse } from 'next/server';

import { getSaasApiContext, saasApiErrorResponse } from '@/server/saas/api';
import { createSaasProjectDocument } from '@/server/saas/project-documents';
import { createProjectDocumentSchema } from '@/server/saas/validation';

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

  const parsed = createProjectDocumentSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ message: '文档标题或 Markdown 内容不正确。' }, { status: 400 });
  }

  const { id } = await routeContext.params;

  try {
    const document = await createSaasProjectDocument(contextResult.context, {
      content: parsed.data.content,
      projectId: id,
      title: parsed.data.title,
    });

    return NextResponse.json({ document }, { status: 201 });
  } catch (error) {
    return saasApiErrorResponse(error);
  }
}
