import { getCmsDatabase } from '@/server/cms/database';

export async function getSaasAdminOverview() {
  const database = getCmsDatabase();

  if (database === undefined) {
    return undefined;
  }

  const [organizationCount, memberCount, userCount, organizations, plans, recentAudits] =
    await Promise.all([
      database.organization.count(),
      database.membership.count(),
      database.user.count(),
      database.organization.findMany({
        include: {
          _count: { select: { memberships: true, projects: true } },
          subscription: { include: { plan: { select: { key: true, name: true } } } },
        },
        orderBy: { createdAt: 'desc' },
        take: 16,
      }),
      database.plan.findMany({
        include: { _count: { select: { subscriptions: true } } },
        orderBy: { key: 'asc' },
      }),
      database.auditLog.findMany({
        include: {
          organization: { select: { name: true } },
          user: { select: { email: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
    ]);

  return { memberCount, organizationCount, organizations, plans, recentAudits, userCount };
}
