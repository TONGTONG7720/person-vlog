import { getCmsDatabase } from '@/server/cms/database';

export async function getAiPlatformAdminOverview() {
  const database = getCmsDatabase();

  if (database === undefined) {
    return undefined;
  }

  const [
    organizationCount,
    workspaceCount,
    assistantCount,
    documentStatus,
    usage,
    failedJobs,
    models,
  ] = await Promise.all([
    database.organization.count(),
    database.aiWorkspace.count(),
    database.aiAssistant.count({ where: { enabled: true } }),
    database.aiKnowledgeDocument.groupBy({ _count: { _all: true }, by: ['status'] }),
    database.aiAssistantUsageLog.aggregate({
      _count: { _all: true },
      _sum: { costMicros: true, inputTokens: true, outputTokens: true },
    }),
    database.aiDocumentJob.findMany({
      include: {
        document: { select: { title: true } },
        organization: { select: { name: true, slug: true } },
        workspace: { select: { name: true } },
      },
      orderBy: { updatedAt: 'desc' },
      take: 12,
      where: { status: 'FAILED' },
    }),
    database.aiModelConfig.findMany({
      orderBy: [{ enabled: 'desc' }, { priority: 'asc' }],
      select: { enabled: true, model: true, provider: true, updatedAt: true },
      take: 12,
    }),
  ]);

  return {
    assistantCount,
    documentStatus,
    failedJobs,
    models,
    organizationCount,
    usage: {
      costMicros: usage._sum.costMicros ?? 0,
      requests: usage._count._all,
      tokens: (usage._sum.inputTokens ?? 0) + (usage._sum.outputTokens ?? 0),
    },
    workspaceCount,
  };
}
