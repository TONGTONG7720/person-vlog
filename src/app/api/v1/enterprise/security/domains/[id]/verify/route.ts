import { NextResponse } from 'next/server';

import { verifyEnterpriseDomain } from '@/server/enterprise/sso-service';
import { getSaasApiContext, saasApiErrorResponse } from '@/server/saas/api';

export const runtime = 'nodejs';

type VerifyDomainRouteProps = Readonly<{
  readonly params: Promise<Readonly<{ readonly id: string }>>;
}>;

export async function POST(
  request: Request,
  { params }: VerifyDomainRouteProps,
): Promise<NextResponse> {
  const contextResult = await getSaasApiContext(request);

  if (contextResult.kind === 'unauthorized') {
    return contextResult.response;
  }

  try {
    const route = await params;
    const verified = await verifyEnterpriseDomain(contextResult.context, route.id);

    return NextResponse.json({ verified });
  } catch (error) {
    return saasApiErrorResponse(error);
  }
}
