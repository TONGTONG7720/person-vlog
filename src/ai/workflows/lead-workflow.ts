import { LeadActivityType, type PrismaClient } from '@/generated/prisma/client';
import { parseLeadAgentResult } from '@/ai/agents/lead-agent';
import { isSafeAiAutomationInput } from '@/ai/lib/automation-safety';
import { getAssistantModelConfiguration } from '@/ai/model-config';
import { buildLeadAgentPrompt } from '@/ai/prompts/automation';
import { logger } from '@/lib/logger';
import { runAiGeneration } from '@/server/ai/model-runner';
import { appendManagedPrompt } from '@/server/ai/prompt-config';

export type LeadWorkflowResult = 'completed' | 'manual-review' | 'not-found';

export function scheduleLeadWorkflow(database: PrismaClient, leadId: string): void {
  if (getAssistantModelConfiguration().kind === 'disabled') {
    return;
  }

  void runLeadWorkflow(database, leadId).catch((error: unknown) => {
    logger.error('ai.workflow.lead_failed', error, { leadId });
  });
}

export async function runLeadWorkflow(
  database: PrismaClient,
  leadId: string,
): Promise<LeadWorkflowResult> {
  const lead = await database.lead.findUnique({
    include: { message: { select: { message: true } } },
    where: { id: leadId },
  });

  if (lead === null) {
    return 'not-found';
  }

  const message = lead.notes ?? lead.message?.message ?? lead.service ?? '';

  if (!isSafeAiAutomationInput(message)) {
    await createManualReview(database, lead.id, 'AI 输入未通过安全检查，已转人工分析。');

    return 'manual-review';
  }

  const prompt = await appendManagedPrompt(
    database,
    'lead-agent',
    buildLeadAgentPrompt({ message, service: lead.service ?? '未指定服务方向' }),
  );
  const generated = await runAiGeneration(database, {
    agent: 'lead',
    maxTokens: 900,
    systemPrompt: prompt,
    taskPrompt: '请完成本次线索分析。',
  });

  if (generated.kind !== 'generated') {
    await createManualReview(database, lead.id, 'AI 分析暂不可用，已转人工处理。');

    return 'manual-review';
  }

  const analysis = parseLeadAgentResult(generated.text);

  if (analysis === undefined) {
    await createManualReview(database, lead.id, 'AI 分析结果未通过安全结构校验，已转人工处理。');

    return 'manual-review';
  }

  await database.lead.update({
    data: {
      aiCategory: analysis.category,
      aiDifficulty: analysis.difficulty,
      aiQuestions: [...analysis.questions],
      aiSuggestedService: analysis.suggestedService,
      aiSummary: analysis.summary,
    },
    where: { id: lead.id },
  });
  await database.leadActivity.create({
    data: {
      content: 'AI 已生成需求摘要与待确认问题，等待人工确认。',
      leadId: lead.id,
      type: LeadActivityType.NOTE,
    },
  });
  await database.adminActivity.create({
    data: {
      action: 'ai_analysis_completed',
      resource: 'crm_lead',
      resourceId: lead.id,
      summary: '新的 AI 线索分析结果已生成',
    },
  });

  return 'completed';
}

async function createManualReview(
  database: PrismaClient,
  leadId: string,
  activityContent: string,
): Promise<void> {
  await database.leadActivity.create({
    data: { content: activityContent, leadId, type: LeadActivityType.NOTE },
  });
  await database.crmTask.create({
    data: { leadId, title: '人工确认线索需求与下一步' },
  });
  await database.adminActivity.create({
    data: {
      action: 'ai_analysis_needs_review',
      resource: 'crm_lead',
      resourceId: leadId,
      summary: 'AI 线索分析需要人工处理',
    },
  });
}
