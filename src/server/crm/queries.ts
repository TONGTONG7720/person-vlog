import { CrmTaskStatus, LeadStatus } from '@/generated/prisma/client';
import type { LeadPriority } from '@/generated/prisma/client';
import {
  crmLeadSourceLabels,
  crmLeadStatuses,
  crmLeadStatusLabels,
  normalizeCrmLeadSource,
} from '@/types/crm';
import type { CrmLeadStatus } from '@/types/crm';
import { getCmsDatabase } from '@/server/cms/database';
import { ensureCrmAutomationRules } from '@/server/crm/automation';
import { crmLeadStatusFromPrisma, crmLeadStatusToPrisma } from '@/server/crm/mappings';
import type { AdminListQuery } from '@/server/cms/queries';

const crmPageSize = 24;

export type CrmDashboardData = Readonly<{
  readonly funnel: readonly Readonly<{
    readonly label: string;
    readonly status: CrmLeadStatus;
    readonly value: number;
  }>[];
  readonly metrics: Readonly<{
    readonly activeClients: number;
    readonly conversionRate: number;
    readonly monthlyLeads: number;
    readonly popularService: string;
    readonly wonProjects: number;
  }>;
  readonly recentLeads: readonly Readonly<{
    readonly createdAt: Date;
    readonly id: string;
    readonly name: string;
    readonly priority: LeadPriority;
    readonly score: number;
    readonly status: LeadStatus;
  }>[];
  readonly sources: readonly Readonly<{
    readonly label: string;
    readonly value: number;
  }>[];
  readonly upcomingTasks: readonly Readonly<{
    readonly dueDate: Date | null;
    readonly id: string;
    readonly leadName: string | null;
    readonly title: string;
  }>[];
}>;

export async function getCrmDashboardData(): Promise<CrmDashboardData | undefined> {
  const database = getCmsDatabase();

  if (database === undefined) {
    return undefined;
  }

  const currentDate = new Date();
  const monthStart = new Date(Date.UTC(currentDate.getUTCFullYear(), currentDate.getUTCMonth(), 1));
  const activeStatuses = [
    LeadStatus.CONTACTED,
    LeadStatus.DISCOVERY,
    LeadStatus.PROPOSAL,
    LeadStatus.NEGOTIATION,
  ];
  const [
    monthlyLeads,
    activeClients,
    totalLeads,
    wonLeads,
    wonProjects,
    leadStatusGroups,
    sourceGroups,
    serviceRecords,
    recentLeads,
    upcomingTasks,
  ] = await Promise.all([
    database.lead.count({ where: { createdAt: { gte: monthStart } } }),
    database.lead.count({ where: { status: { in: activeStatuses } } }),
    database.lead.count(),
    database.lead.count({ where: { status: LeadStatus.WON } }),
    database.crmProject.count(),
    database.lead.groupBy({ by: ['status'], _count: { _all: true } }),
    database.lead.groupBy({
      by: ['source'],
      where: { source: { not: null } },
      _count: { _all: true },
    }),
    database.lead.findMany({ select: { service: true } }),
    database.lead.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        createdAt: true,
        id: true,
        name: true,
        priority: true,
        score: true,
        status: true,
      },
      take: 6,
    }),
    database.crmTask.findMany({
      include: { lead: { select: { name: true } } },
      orderBy: [{ dueDate: 'asc' }, { createdAt: 'asc' }],
      take: 6,
      where: { status: { in: [CrmTaskStatus.TODO, CrmTaskStatus.IN_PROGRESS] } },
    }),
  ]);
  const statusCounts = new Map<CrmLeadStatus, number>();

  for (const group of leadStatusGroups) {
    statusCounts.set(crmLeadStatusFromPrisma[group.status], group._count._all);
  }

  const sourceCounts = new Map<string, number>();

  for (const group of sourceGroups) {
    if (group.source === null) {
      continue;
    }

    const normalizedSource = normalizeCrmLeadSource(group.source);
    const sourceLabel =
      normalizedSource === undefined ? group.source : crmLeadSourceLabels[normalizedSource];
    sourceCounts.set(sourceLabel, (sourceCounts.get(sourceLabel) ?? 0) + group._count._all);
  }

  const serviceCounts = new Map<string, number>();

  for (const record of serviceRecords) {
    if (record.service === null || record.service.trim() === '') {
      continue;
    }

    serviceCounts.set(record.service, (serviceCounts.get(record.service) ?? 0) + 1);
  }

  const popularService =
    [...serviceCounts.entries()].sort((left, right) => right[1] - left[1])[0]?.[0] ?? '暂无';

  return {
    funnel: crmLeadStatuses.map((status) => ({
      label: crmLeadStatusLabels[status],
      status,
      value: statusCounts.get(status) ?? 0,
    })),
    metrics: {
      activeClients,
      conversionRate: totalLeads === 0 ? 0 : Math.round((wonLeads / totalLeads) * 100),
      monthlyLeads,
      popularService,
      wonProjects,
    },
    recentLeads,
    sources: [...sourceCounts.entries()]
      .map(([label, value]) => ({ label, value }))
      .sort((left, right) => right.value - left.value)
      .slice(0, 6),
    upcomingTasks: upcomingTasks.map((task) => ({
      dueDate: task.dueDate,
      id: task.id,
      leadName: task.lead?.name ?? null,
      title: task.title,
    })),
  };
}

export async function getCrmLeads(query: AdminListQuery, status?: CrmLeadStatus) {
  const database = getCmsDatabase();

  if (database === undefined) {
    return [];
  }

  return database.lead.findMany({
    include: {
      activities: { orderBy: { createdAt: 'desc' }, take: 1 },
      tasks: {
        orderBy: [{ dueDate: 'asc' }, { createdAt: 'asc' }],
        take: 1,
        where: { status: { in: [CrmTaskStatus.TODO, CrmTaskStatus.IN_PROGRESS] } },
      },
    },
    orderBy: [{ priority: 'desc' }, { updatedAt: 'desc' }],
    skip: (query.page - 1) * crmPageSize,
    take: crmPageSize,
    where: {
      ...(status === undefined ? {} : { status: crmLeadStatusToPrisma[status] }),
      ...(query.search === ''
        ? {}
        : {
            OR: [
              { company: { contains: query.search, mode: 'insensitive' } },
              { email: { contains: query.search, mode: 'insensitive' } },
              { name: { contains: query.search, mode: 'insensitive' } },
              { service: { contains: query.search, mode: 'insensitive' } },
            ],
          }),
    },
  });
}

export async function getCrmLeadDetail(id: string) {
  const database = getCmsDatabase();

  return database === undefined
    ? undefined
    : database.lead.findUnique({
        include: {
          activities: { orderBy: { createdAt: 'desc' } },
          message: true,
          projects: { orderBy: { updatedAt: 'desc' } },
          proposals: { orderBy: { updatedAt: 'desc' } },
          tasks: { orderBy: [{ dueDate: 'asc' }, { createdAt: 'desc' }] },
        },
        where: { id },
      });
}

export async function getCrmTasks() {
  const database = getCmsDatabase();

  return database === undefined
    ? []
    : database.crmTask.findMany({
        include: { lead: { select: { name: true } } },
        orderBy: [{ status: 'asc' }, { dueDate: 'asc' }, { createdAt: 'desc' }],
        take: 80,
      });
}

export async function getCrmProjects() {
  const database = getCmsDatabase();

  return database === undefined
    ? []
    : database.crmProject.findMany({
        include: { lead: { select: { name: true } } },
        orderBy: { updatedAt: 'desc' },
        take: 80,
      });
}

export async function getCrmAutomationRules() {
  const database = getCmsDatabase();

  if (database === undefined) {
    return [];
  }

  await ensureCrmAutomationRules(database);

  return database.automationRule.findMany({ orderBy: { name: 'asc' } });
}
