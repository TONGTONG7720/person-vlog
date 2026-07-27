import { NextResponse } from 'next/server';

import { saveEnterpriseSsoConnection } from '@/server/enterprise/sso-service';
import { enterpriseSsoConnectionSchema } from '@/server/enterprise/validation';
import { getSaasApiContext, saasApiErrorResponse } from '@/server/saas/api';

export const runtime = 'nodejs';

export async function PUT(request: Request): Promise<NextResponse> {
  const contextResult = await getSaasApiContext(request);

  if (contextResult.kind === 'unauthorized') {
    return contextResult.response;
  }

  const payload = await readJson(request);
  const parsed = enterpriseSsoConnectionSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { message: 'SSO 配置内容不正确，请使用 HTTPS 地址和环境变量引用。' },
      { status: 400 },
    );
  }

  try {
    const connection = await saveEnterpriseSsoConnection(contextResult.context, {
      ...(parsed.data.authorizationUrl === undefined
        ? {}
        : { authorizationUrl: parsed.data.authorizationUrl }),
      ...(parsed.data.clientId === undefined ? {} : { clientId: parsed.data.clientId }),
      enabled: parsed.data.enabled,
      ...(parsed.data.metadataUrl === undefined ? {} : { metadataUrl: parsed.data.metadataUrl }),
      provider: parsed.data.provider,
      ...(parsed.data.secretReference === undefined
        ? {}
        : { secretReference: parsed.data.secretReference }),
    });

    return NextResponse.json({ connection });
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
