import { ProposalStatus, type PrismaClient } from '@/generated/prisma/client';
import { getProposalTemplateId } from '@/ai/agents/proposal-agent';
import { isSafeAiAutomationInput, isSafeAiCommercialDraft } from '@/ai/lib/automation-safety';
import { buildProposalAgentPrompt } from '@/ai/prompts/automation';
import { getProposalTemplate } from '@/ai/templates';
import { runAiGeneration } from '@/server/ai/model-runner';
import { appendManagedPrompt } from '@/server/ai/prompt-config';

export type ProposalWorkflowResult = 'completed' | 'manual-review' | 'not-found';

export async function runProposalWorkflow(
  database: PrismaClient,
  leadId: string,
): Promise<ProposalWorkflowResult> {
  const lead = await database.lead.findUnique({
    include: { message: { select: { message: true } } },
    where: { id: leadId },
  });

  if (lead === null) {
    return 'not-found';
  }

  const message = lead.aiSummary ?? lead.notes ?? lead.message?.message ?? '';

  if (!isSafeAiAutomationInput(message)) {
    return 'manual-review';
  }

  const templateId = getProposalTemplateId(lead.service ?? '企业管理系统');
  const template = await getProposalTemplate(templateId);
  const prompt = await appendManagedPrompt(
    database,
    'proposal-agent',
    buildProposalAgentPrompt({
      message,
      service: lead.service ?? '未指定服务方向',
      template,
      templateId,
    }),
  );
  const generated = await runAiGeneration(database, {
    agent: 'proposal',
    maxTokens: 1_600,
    systemPrompt: prompt,
    taskPrompt: '请生成初版方案草稿。',
  });

  if (
    generated.kind !== 'generated' ||
    generated.text.trim() === '' ||
    !isSafeAiCommercialDraft(generated.text)
  ) {
    return 'manual-review';
  }

  const proposal = await database.proposal.create({
    data: {
      aiGenerated: true,
      content: generated.text.trim(),
      leadId: lead.id,
      status: ProposalStatus.DRAFT,
      title: `AI 初版方案：${lead.service ?? '合作需求'}`,
    },
  });
  await database.adminActivity.create({
    data: {
      action: 'ai_proposal_created',
      resource: 'crm_proposal',
      resourceId: proposal.id,
      summary: 'AI 已生成待审核方案草稿',
    },
  });

  return 'completed';
}
