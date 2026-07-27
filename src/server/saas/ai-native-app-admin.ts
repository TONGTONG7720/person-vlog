import { AiUsageChannel } from '@/generated/prisma/client';
import { getCmsDatabase } from '@/server/cms/database';

export async function getAiNativeAppAdminOverview() {
  const database = getCmsDatabase();

  if (database === undefined) {
    return undefined;
  }

  const periodStart = new Date();
  periodStart.setDate(periodStart.getDate() - 30);
  const [apps, templateCount, statusCounts, usage] = await Promise.all([
    database.aiApp.findMany({
      include: {
        accessRules: { select: { kind: true } },
        organization: { select: { name: true, slug: true } },
        workspace: { select: { name: true } },
      },
      orderBy: { updatedAt: 'desc' },
      take: 40,
    }),
    database.aiAppTemplate.count({ where: { enabled: true } }),
    database.aiApp.groupBy({ _count: { _all: true }, by: ['status'] }),
    database.aiAssistantUsageLog.aggregate({
      _count: { _all: true },
      _sum: { costMicros: true, inputTokens: true, outputTokens: true },
      where: { channel: AiUsageChannel.APP, createdAt: { gte: periodStart } },
    }),
  ]);

  return {
    apps,
    statusCounts,
    templateCount,
    usage: {
      costMicros: usage._sum.costMicros ?? 0,
      requestCount: usage._count._all,
      tokenCount: (usage._sum.inputTokens ?? 0) + (usage._sum.outputTokens ?? 0),
    },
  };
}
