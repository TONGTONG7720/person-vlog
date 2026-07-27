import { NextResponse } from 'next/server';

import { requireSaasPermission } from '@/server/saas/auth';
import { requireCmsDatabase } from '@/server/cms/database';
import { getSaasApiContext, saasApiErrorResponse } from '@/server/saas/api';
import { saasPermissions } from '@/server/saas/rbac';

export const runtime = 'nodejs';

export async function GET(request: Request): Promise<NextResponse> {
  const contextResult = await getSaasApiContext(request);

  if (contextResult.kind === 'unauthorized') {
    return contextResult.response;
  }

  try {
    requireSaasPermission(contextResult.context, saasPermissions.auditRead);
    const database = requireCmsDatabase();
    const audits = await database.auditLog.findMany({
      include: { user: { select: { email: true } } },
      orderBy: { createdAt: 'desc' },
      take: 100,
      where: {
        enterpriseId: contextResult.context.enterprise.id,
        organizationId: contextResult.context.organization.id,
      },
    });

    return NextResponse.json({ audits });
  } catch (error) {
    return saasApiErrorResponse(error);
  }
}
