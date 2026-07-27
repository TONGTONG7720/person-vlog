import { NextResponse } from 'next/server';

import { revokeSaasAiApiKey } from '@/server/saas/ai-api-keys';
import { getSaasApiContext, saasApiErrorResponse } from '@/server/saas/api';

export const runtime = 'nodejs';

type DisableApiKeyRouteProps = Readonly<{
  readonly params: Promise<Readonly<{ readonly id: string }>>;
}>;

export async function POST(
  request: Request,
  { params }: DisableApiKeyRouteProps,
): Promise<NextResponse> {
  const contextResult = await getSaasApiContext(request);

  if (contextResult.kind === 'unauthorized') {
    return contextResult.response;
  }

  try {
    const route = await params;
    await revokeSaasAiApiKey(contextResult.context, route.id);

    return NextResponse.json({ revoked: true });
  } catch (error) {
    return saasApiErrorResponse(error);
  }
}
