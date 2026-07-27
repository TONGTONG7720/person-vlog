import { AiUsageStatus } from '@/generated/prisma/client';
import type { AiAutomationAgent } from '@/ai/automation-types';
import { getCmsDatabase } from '@/server/cms/database';
import { ensureAiAutomationDefaults } from '@/server/ai/defaults';
import { aiAgentTypeFromPrisma } from '@/server/ai/mappings';

const aiDashboardLogLimit = 20;
const aiDashboardResourceLimit = 10;

export type AiCenterData = Readonly<{
  readonly contentDrafts: readonly Readonly<{
    readonly createdAt: Date;
    readonly id: string;
    readonly status: string;
    readonly title: string;
    readonly topic: string;
  }>[];
  readonly leads: readonly Readonly<{
    readonly aiCategory: string | null;
    readonly aiDifficulty: string | null;
    readonly aiQuestions: readonly string[];
    readonly aiSuggestedService: string | null;
    readonly aiSummary: string | null;
    readonly id: string;
    readonly name: string;
    readonly service: string | null;
  }>[];
  readonly logs: readonly Readonly<{
    readonly agent: AiAutomationAgent;
    readonly costMicros: number;
    readonly createdAt: Date;
    readonly id: string;
    readonly inputTokens: number;
    readonly model: string;
    readonly outputTokens: number;
    readonly provider: string;
    readonly status: string;
  }>[];
  readonly metrics: Readonly<{
    readonly calls: number;
    readonly successRate: number;
    readonly successfulCalls: number;
    readonly usageByAgent: readonly Readonly<{ readonly agent: string; readonly value: number }>[];
  }>;
  readonly modelConfigs: readonly Readonly<{
    readonly dailyLimit: number | null;
    readonly enabled: boolean;
    readonly id: string;
    readonly maxTokens: number;
    readonly model: string;
    readonly monthlyLimit: number | null;
    readonly priority: number;
    readonly provider: string;
  }>[];
  readonly notificationChannels: readonly Readonly<{
    readonly enabled: boolean;
    readonly id: string;
    readonly type: string;
  }>[];
  readonly projectPlans: readonly Readonly<{
    readonly createdAt: Date;
    readonly id: string;
    readonly projectTitle: string;
    readonly status: string;
    readonly summary: string;
    readonly tasks: readonly string[];
  }>[];
  readonly projects: readonly Readonly<{
    readonly description: string | null;
    readonly id: string;
    readonly title: string;
  }>[];
  readonly prompts: readonly Readonly<{
    readonly content: string;
    readonly createdAt: Date;
    readonly enabled: boolean;
    readonly id: string;
    readonly name: string;
    readonly version: number;
  }>[];
}>;

function getThirtyDaysAgo(): Date {
  const today = new Date();

  return new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() - 30));
}

export async function getAiCenterData(): Promise<AiCenterData | undefined> {
  const database = getCmsDatabase();

  if (database === undefined) {
    return undefined;
  }

  await ensureAiAutomationDefaults(database);
  const periodStart = getThirtyDaysAgo();
  const [
    calls,
    successfulCalls,
    agentGroups,
    logs,
    modelConfigs,
    notificationChannels,
    prompts,
    leads,
    projects,
    contentDrafts,
    projectPlans,
  ] = await Promise.all([
    database.aiUsageLog.count({ where: { createdAt: { gte: periodStart } } }),
    database.aiUsageLog.count({
      where: { createdAt: { gte: periodStart }, status: AiUsageStatus.COMPLETED },
    }),
    database.aiUsageLog.groupBy({
      _count: { _all: true },
      by: ['agent'],
      where: { createdAt: { gte: periodStart } },
    }),
    database.aiUsageLog.findMany({ orderBy: { createdAt: 'desc' }, take: aiDashboardLogLimit }),
    database.aiModelConfig.findMany({ orderBy: { priority: 'asc' } }),
    database.notificationChannel.findMany({ orderBy: { type: 'asc' } }),
    database.prompt.findMany({ orderBy: [{ name: 'asc' }, { version: 'desc' }] }),
    database.lead.findMany({
      orderBy: { updatedAt: 'desc' },
      select: {
        aiCategory: true,
        aiDifficulty: true,
        aiQuestions: true,
        aiSuggestedService: true,
        aiSummary: true,
        id: true,
        name: true,
        service: true,
      },
      take: aiDashboardResourceLimit,
    }),
    database.crmProject.findMany({
      orderBy: { updatedAt: 'desc' },
      select: { description: true, id: true, title: true },
      take: aiDashboardResourceLimit,
    }),
    database.aiContentDraft.findMany({
      orderBy: { updatedAt: 'desc' },
      select: { createdAt: true, id: true, status: true, title: true, topic: true },
      take: aiDashboardResourceLimit,
    }),
    database.aiProjectPlan.findMany({
      include: { project: { select: { title: true } } },
      orderBy: { updatedAt: 'desc' },
      take: aiDashboardResourceLimit,
    }),
  ]);

  return {
    contentDrafts,
    leads,
    logs: logs.map((log) => ({
      agent: aiAgentTypeFromPrisma[log.agent],
      costMicros: log.costMicros,
      createdAt: log.createdAt,
      id: log.id,
      inputTokens: log.inputTokens,
      model: log.model,
      outputTokens: log.outputTokens,
      provider: log.provider,
      status: log.status,
    })),
    metrics: {
      calls,
      successRate: calls === 0 ? 0 : Math.round((successfulCalls / calls) * 100),
      successfulCalls,
      usageByAgent: agentGroups.map((group) => ({
        agent: aiAgentTypeFromPrisma[group.agent],
        value: group._count._all,
      })),
    },
    modelConfigs,
    notificationChannels,
    projectPlans: projectPlans.map((plan) => ({
      createdAt: plan.createdAt,
      id: plan.id,
      projectTitle: plan.project.title,
      status: plan.status,
      summary: plan.summary,
      tasks: plan.tasks,
    })),
    projects,
    prompts,
  };
}
