import { KnowledgeSyncStatus, type PrismaClient } from '@/generated/prisma/client';
import { parseKnowledgeAgentResult } from '@/ai/agents/knowledge-agent';
import { isSafeAiAutomationInput } from '@/ai/lib/automation-safety';
import { buildKnowledgeAgentPrompt } from '@/ai/prompts/automation';
import { runAiGeneration } from '@/server/ai/model-runner';
import { appendManagedPrompt } from '@/server/ai/prompt-config';

export type KnowledgeWorkflowResult = 'completed' | 'manual-review' | 'not-found';

export async function runKnowledgeWorkflow(
  database: PrismaClient,
  projectId: string,
): Promise<KnowledgeWorkflowResult> {
  const project = await database.crmProject.findUnique({ where: { id: projectId } });

  if (project === null) {
    return 'not-found';
  }

  const sourceText = `${project.title}\n${project.description ?? ''}`.trim();

  if (!isSafeAiAutomationInput(sourceText)) {
    return 'manual-review';
  }

  const prompt = await appendManagedPrompt(
    database,
    'knowledge-agent',
    buildKnowledgeAgentPrompt({ sourceLabel: 'CRM 客户项目', sourceText }),
  );
  const generated = await runAiGeneration(database, {
    agent: 'knowledge',
    maxTokens: 1_100,
    systemPrompt: prompt,
    taskPrompt: '请生成待审核的知识条目。',
  });

  if (generated.kind !== 'generated') {
    return 'manual-review';
  }

  const knowledge = parseKnowledgeAgentResult(generated.text);

  if (knowledge === undefined) {
    return 'manual-review';
  }

  const entry = await database.knowledge.upsert({
    create: {
      aiGenerated: true,
      category: knowledge.category,
      content: knowledge.content,
      enabled: false,
      slug: `ai-project-${project.id}`,
      source: 'ai-project-workflow',
      syncStatus: KnowledgeSyncStatus.PENDING,
      title: knowledge.title,
    },
    update: {
      aiGenerated: true,
      category: knowledge.category,
      content: knowledge.content,
      enabled: false,
      source: 'ai-project-workflow',
      syncStatus: KnowledgeSyncStatus.PENDING,
      title: knowledge.title,
    },
    where: { slug: `ai-project-${project.id}` },
  });
  await database.adminActivity.create({
    data: {
      action: 'ai_knowledge_draft_created',
      resource: 'knowledge',
      resourceId: entry.id,
      summary: 'AI 已生成待审核知识条目',
    },
  });

  return 'completed';
}
