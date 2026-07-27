import { AiProjectPlanStatus, type PrismaClient } from '@/generated/prisma/client';
import { parseProjectAgentResult } from '@/ai/agents/project-agent';
import { isSafeAiAutomationInput } from '@/ai/lib/automation-safety';
import { buildProjectAgentPrompt } from '@/ai/prompts/automation';
import { runAiGeneration } from '@/server/ai/model-runner';
import { appendManagedPrompt } from '@/server/ai/prompt-config';

export type ProjectWorkflowResult = 'completed' | 'manual-review' | 'not-found';

export async function runProjectWorkflow(
  database: PrismaClient,
  projectId: string,
): Promise<ProjectWorkflowResult> {
  const project = await database.crmProject.findUnique({ where: { id: projectId } });

  if (project === null) {
    return 'not-found';
  }

  const description = project.description ?? project.title;

  if (!isSafeAiAutomationInput(description)) {
    return 'manual-review';
  }

  const prompt = await appendManagedPrompt(
    database,
    'project-agent',
    buildProjectAgentPrompt({ description, title: project.title }),
  );
  const generated = await runAiGeneration(database, {
    agent: 'project',
    maxTokens: 1_100,
    systemPrompt: prompt,
    taskPrompt: '请生成项目任务建议。',
  });

  if (generated.kind !== 'generated') {
    return 'manual-review';
  }

  const plan = parseProjectAgentResult(generated.text);

  if (plan === undefined) {
    return 'manual-review';
  }

  const savedPlan = await database.aiProjectPlan.create({
    data: {
      projectId: project.id,
      status: AiProjectPlanStatus.DRAFT,
      summary: plan.summary,
      tasks: [...plan.tasks],
    },
  });
  await database.adminActivity.create({
    data: {
      action: 'ai_project_plan_created',
      resource: 'ai_project_plan',
      resourceId: savedPlan.id,
      summary: 'AI 已生成待审核项目任务计划',
    },
  });

  return 'completed';
}
