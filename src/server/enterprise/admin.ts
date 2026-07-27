import { getCmsDatabase } from '@/server/cms/database';

export async function getEnterpriseAdminOverview() {
  const database = getCmsDatabase();

  if (database === undefined) {
    return undefined;
  }

  const [enterprises, reviewDocumentCount, activeSsoCount] = await Promise.all([
    database.enterprise.findMany({
      include: {
        _count: {
          select: {
            departments: true,
            memberships: true,
            organizations: true,
            ssoConnections: true,
          },
        },
        organizations: {
          select: { id: true, name: true, slug: true },
          take: 6,
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 80,
    }),
    database.aiKnowledgeDocument.count({ where: { status: 'SECURITY_REVIEW' } }),
    database.sSOConnection.count({ where: { enabled: true } }),
  ]);

  return { activeSsoCount, enterprises, reviewDocumentCount };
}

export async function getEnterpriseAuditAdminRows(search: string) {
  const database = getCmsDatabase();

  if (database === undefined) {
    return undefined;
  }

  const query = search.trim();

  return database.auditLog.findMany({
    include: {
      enterprise: { select: { name: true } },
      organization: { select: { name: true, slug: true } },
      user: { select: { email: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 300,
    ...(query === ''
      ? {}
      : {
          where: {
            OR: [
              { action: { contains: query, mode: 'insensitive' } },
              { resource: { contains: query, mode: 'insensitive' } },
              { enterprise: { name: { contains: query, mode: 'insensitive' } } },
              { organization: { name: { contains: query, mode: 'insensitive' } } },
              { user: { email: { contains: query, mode: 'insensitive' } } },
            ],
          },
        }),
  });
}
