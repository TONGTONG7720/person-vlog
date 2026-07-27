import { NextResponse } from 'next/server';

import { rotateSaasAiApiKey } from '@/server/saas/ai-api-keys';
import { getSaasApiContext, saasApiErrorResponse } from '@/server/saas/api';

export const runtime = 'nodejs';

type RotateApiKeyRouteProps = Readonly<{
  readonly params: Promise<Readonly<{ readonly id: string }>>;
}>;

export async function POST(
  request: Request,
  { params }: RotateApiKeyRouteProps,
): Promise<NextResponse> {
  const contextResult = await getSaasApiContext(request);

  if (contextResult.kind === 'unauthorized') {
    return contextResult.response;
  }

  try {
    const route = await params;
    const apiKey = await rotateSaasAiApiKey(contextResult.context, route.id);

    return NextResponse.json({ apiKey });
  } catch (error) {
    return saasApiErrorResponse(error);
  }
}
