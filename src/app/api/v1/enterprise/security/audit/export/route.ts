import { requireSaasPermission } from '@/server/saas/auth';
import { requireCmsDatabase } from '@/server/cms/database';
import { getSaasApiContext, saasApiErrorResponse } from '@/server/saas/api';
import { saasPermissions } from '@/server/saas/rbac';

export const runtime = 'nodejs';

export async function GET(request: Request): Promise<Response> {
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
      take: 10_000,
      where: {
        enterpriseId: contextResult.context.enterprise.id,
        organizationId: contextResult.context.organization.id,
      },
    });
    const rows = [
      ['timestamp', 'action', 'resource', 'resource_id', 'actor'].join(','),
      ...audits.map((audit) =>
        [
          audit.createdAt.toISOString(),
          csvCell(audit.action),
          csvCell(audit.resource),
          csvCell(audit.resourceId ?? ''),
          csvCell(audit.user?.email ?? 'system'),
        ].join(','),
      ),
    ];

    return new Response(rows.join('\n'), {
      headers: {
        'Cache-Control': 'no-store',
        'Content-Disposition': 'attachment; filename="enterprise-audit.csv"',
        'Content-Type': 'text/csv; charset=utf-8',
      },
    });
  } catch (error) {
    return saasApiErrorResponse(error);
  }
}

function csvCell(value: string): string {
  const protectedValue = /^[=+\-@]/u.test(value) ? `'${value}` : value;

  return `"${protectedValue.replaceAll('"', '""')}"`;
}
