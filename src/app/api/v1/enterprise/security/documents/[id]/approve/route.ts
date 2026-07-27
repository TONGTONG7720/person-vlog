import { NextResponse } from 'next/server';

import { approveSaasAiDocumentSecurityReview } from '@/server/saas/ai-document-jobs';
import { getSaasApiContext, saasApiErrorResponse } from '@/server/saas/api';

export const runtime = 'nodejs';

type ApproveDocumentRouteProps = Readonly<{
  readonly params: Promise<Readonly<{ readonly id: string }>>;
}>;

export async function POST(
  request: Request,
  { params }: ApproveDocumentRouteProps,
): Promise<NextResponse> {
  const contextResult = await getSaasApiContext(request);

  if (contextResult.kind === 'unauthorized') {
    return contextResult.response;
  }

  try {
    const route = await params;
    await approveSaasAiDocumentSecurityReview(contextResult.context, route.id);

    return NextResponse.json({ approved: true });
  } catch (error) {
    return saasApiErrorResponse(error);
  }
}
