import { NextResponse } from 'next/server';

import { getSaasApiContext, saasApiErrorResponse } from '@/server/saas/api';
import { processSaasAiDocument } from '@/server/saas/ai-document-jobs';

export const runtime = 'nodejs';

type DocumentRouteContext = Readonly<{
  readonly params: Promise<Readonly<{ readonly id: string }>>;
}>;

export async function POST(
  request: Request,
  routeContext: DocumentRouteContext,
): Promise<NextResponse> {
  const contextResult = await getSaasApiContext(request);

  if (contextResult.kind === 'unauthorized') {
    return contextResult.response;
  }

  const { id } = await routeContext.params;

  try {
    const document = await processSaasAiDocument(contextResult.context, id);

    return NextResponse.json({ document });
  } catch (error) {
    return saasApiErrorResponse(error);
  }
}
