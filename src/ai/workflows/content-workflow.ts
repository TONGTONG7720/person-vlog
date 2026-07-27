import { AiContentDraftStatus, type PrismaClient } from '@/generated/prisma/client';
import { parseContentAgentResult } from '@/ai/agents/content-agent';
import { isSafeAiAutomationInput } from '@/ai/lib/automation-safety';
import { buildContentAgentPrompt } from '@/ai/prompts/automation';
import { runAiGeneration } from '@/server/ai/model-runner';
import { appendManagedPrompt } from '@/server/ai/prompt-config';

export type ContentWorkflowResult = 'completed' | 'manual-review';

export async function runContentWorkflow(
  database: PrismaClient,
  topic: string,
): Promise<ContentWorkflowResult> {
  if (!isSafeAiAutomationInput(topic)) {
    return 'manual-review';
  }

  const prompt = await appendManagedPrompt(
    database,
    'content-agent',
    buildContentAgentPrompt({ topic }),
  );
  const generated = await runAiGeneration(database, {
    agent: 'content',
    maxTokens: 1_100,
    systemPrompt: prompt,
    taskPrompt: '请生成内容草稿。',
  });

  if (generated.kind !== 'generated') {
    return 'manual-review';
  }

  const draft = parseContentAgentResult(generated.text);

  if (draft === undefined) {
    return 'manual-review';
  }

  const contentDraft = await database.aiContentDraft.create({
    data: {
      outline: [...draft.outline],
      seoDescription: draft.seoDescription,
      status: AiContentDraftStatus.DRAFT,
      title: draft.title,
      topic,
      videoScript: draft.videoScript,
      xiaohongshuDirection: draft.xiaohongshuDirection,
    },
  });
  await database.adminActivity.create({
    data: {
      action: 'ai_content_draft_created',
      resource: 'ai_content_draft',
      resourceId: contentDraft.id,
      summary: 'AI 已生成待审核内容草稿',
    },
  });

  return 'completed';
}
