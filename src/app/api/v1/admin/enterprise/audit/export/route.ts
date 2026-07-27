import { getAdminSession } from '@/server/cms/auth';
import { requireCmsDatabase } from '@/server/cms/database';

export const runtime = 'nodejs';

export async function GET(): Promise<Response> {
  const session = await getAdminSession();

  if (session === undefined) {
    return new Response(JSON.stringify({ message: '请先登录管理员账号。' }), {
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      status: 401,
    });
  }

  const database = requireCmsDatabase();
  const audits = await database.auditLog.findMany({
    include: {
      enterprise: { select: { name: true } },
      organization: { select: { name: true, slug: true } },
      user: { select: { email: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 20_000,
  });
  const rows = [
    ['timestamp', 'enterprise', 'organization', 'action', 'resource', 'actor'].join(','),
    ...audits.map((audit) =>
      [
        audit.createdAt.toISOString(),
        csvCell(audit.enterprise.name),
        csvCell(audit.organization.slug),
        csvCell(audit.action),
        csvCell(audit.resource),
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
}

function csvCell(value: string): string {
  const protectedValue = /^[=+\-@]/u.test(value) ? `'${value}` : value;

  return `"${protectedValue.replaceAll('"', '""')}"`;
}
