import { NextResponse } from 'next/server';

import { createEnterpriseDomain } from '@/server/enterprise/sso-service';
import { enterpriseDomainSchema } from '@/server/enterprise/validation';
import { getSaasApiContext, saasApiErrorResponse } from '@/server/saas/api';

export const runtime = 'nodejs';

export async function POST(request: Request): Promise<NextResponse> {
  const contextResult = await getSaasApiContext(request);

  if (contextResult.kind === 'unauthorized') {
    return contextResult.response;
  }

  const payload = await readJson(request);
  const parsed = enterpriseDomainSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ message: '域名格式不正确。' }, { status: 400 });
  }

  try {
    const domain = await createEnterpriseDomain(contextResult.context, parsed.data.domain);

    if (domain === undefined) {
      return NextResponse.json(
        { message: '该域名已被另一个企业占用或格式不正确。' },
        { status: 409 },
      );
    }

    return NextResponse.json({ domain }, { status: 201 });
  } catch (error) {
    return saasApiErrorResponse(error);
  }
}

async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return undefined;
  }
}
