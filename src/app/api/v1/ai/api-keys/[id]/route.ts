import { NextResponse } from 'next/server';

import { getSaasApiContext, saasApiErrorResponse } from '@/server/saas/api';
import { deleteSaasAiApiKey } from '@/server/saas/ai-api-keys';

export const runtime = 'nodejs';

type ApiKeyRouteContext = Readonly<{ readonly params: Promise<Readonly<{ readonly id: string }>> }>;

export async function DELETE(
  request: Request,
  routeContext: ApiKeyRouteContext,
): Promise<NextResponse> {
  const contextResult = await getSaasApiContext(request);

  if (contextResult.kind === 'unauthorized') {
    return contextResult.response;
  }

  const { id } = await routeContext.params;

  try {
    await deleteSaasAiApiKey(contextResult.context, id);

    return NextResponse.json({ deleted: true });
  } catch (error) {
    return saasApiErrorResponse(error);
  }
}
