import { NextResponse } from 'next/server';

import { writeEnterpriseAuditLog } from '@/server/enterprise/audit';
import {
  getEnterpriseSecurityOverview,
  updateEnterpriseSecurityPolicy,
} from '@/server/enterprise/security-service';
import { enterpriseSecurityPolicySchema } from '@/server/enterprise/validation';
import { getSaasApiContext, saasApiErrorResponse } from '@/server/saas/api';

export const runtime = 'nodejs';

export async function GET(request: Request): Promise<NextResponse> {
  const contextResult = await getSaasApiContext(request);

  if (contextResult.kind === 'unauthorized') {
    return contextResult.response;
  }

  try {
    return NextResponse.json({
      security: await getEnterpriseSecurityOverview(contextResult.context),
    });
  } catch (error) {
    return saasApiErrorResponse(error);
  }
}

export async function PATCH(request: Request): Promise<NextResponse> {
  const contextResult = await getSaasApiContext(request);

  if (contextResult.kind === 'unauthorized') {
    return contextResult.response;
  }

  const payload = await readJson(request);
  const parsed = enterpriseSecurityPolicySchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ message: '安全策略内容不正确。' }, { status: 400 });
  }

  try {
    const policy = await updateEnterpriseSecurityPolicy(contextResult.context, parsed.data);
    await writeEnterpriseAuditLog({
      action: 'enterprise.security_policy.updated',
      enterpriseId: contextResult.context.enterprise.id,
      metadata: parsed.data,
      organizationId: contextResult.context.organization.id,
      resource: 'enterprise_security_policy',
      resourceId: policy.id,
      userId: contextResult.context.user.id,
    });

    return NextResponse.json({ policy });
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
