'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { runContentWorkflow } from '@/ai/workflows/content-workflow';
import { runKnowledgeWorkflow } from '@/ai/workflows/knowledge-workflow';
import { runLeadWorkflow } from '@/ai/workflows/lead-workflow';
import { runMeetingWorkflow } from '@/ai/workflows/meeting-workflow';
import { runProjectWorkflow } from '@/ai/workflows/project-workflow';
import { runProposalWorkflow } from '@/ai/workflows/proposal-workflow';
import { AiContentDraftStatus } from '@/generated/prisma/client';
import { recordAdminActivity } from '@/server/cms/activity';
import {
  parseAiContentDraftReviewForm,
  parseAiContentWorkflowForm,
  parseAiKnowledgeWorkflowForm,
  parseAiLeadWorkflowForm,
  parseAiMeetingWorkflowForm,
  parseAiProjectPlanApprovalForm,
  parseAiProjectWorkflowForm,
  parseAiProposalWorkflowForm,
} from '@/server/ai/validation';

import { getAdminActionContext } from './action-utils';

const aiCenterPath = '/admin/ai';

export async function runAiLeadAnalysis(formData: FormData): Promise<void> {
  const parsed = parseAiLeadWorkflowForm(formData);

  if (parsed.kind === 'invalid') {
    redirect(`${aiCenterPath}?error=1`);
  }

  const { database } = await getAdminActionContext();
  const result = await runLeadWorkflow(database, parsed.value.leadId);

  refreshAiResources();
  redirect(
    result === 'completed'
      ? `/admin/crm/leads/${parsed.value.leadId}?success=1`
      : `/admin/crm/leads/${parsed.value.leadId}?error=1`,
  );
}

export async function runAiProposalDraft(formData: FormData): Promise<void> {
  const parsed = parseAiProposalWorkflowForm(formData);

  if (parsed.kind === 'invalid') {
    redirect(`${aiCenterPath}?error=1`);
  }

  const { database } = await getAdminActionContext();
  const result = await runProposalWorkflow(database, parsed.value.leadId);

  refreshAiResources();
  redirect(
    result === 'completed'
      ? `/admin/crm/leads/${parsed.value.leadId}?success=1`
      : `/admin/crm/leads/${parsed.value.leadId}?error=1`,
  );
}

export async function runAiContentDraft(formData: FormData): Promise<void> {
  const parsed = parseAiContentWorkflowForm(formData);

  if (parsed.kind === 'invalid') {
    redirect(`${aiCenterPath}?error=1`);
  }

  const { database } = await getAdminActionContext();
  const result = await runContentWorkflow(database, parsed.value.topic);

  refreshAiResources();
  redirect(`${aiCenterPath}?${result === 'completed' ? 'success' : 'error'}=1`);
}

export async function runAiMeetingSummary(formData: FormData): Promise<void> {
  const parsed = parseAiMeetingWorkflowForm(formData);

  if (parsed.kind === 'invalid') {
    redirect(`${aiCenterPath}?error=1`);
  }

  const { database } = await getAdminActionContext();
  const result = await runMeetingWorkflow(database, parsed.value);

  refreshAiResources();
  redirect(`${aiCenterPath}?${result === 'completed' ? 'success' : 'error'}=1`);
}

export async function runAiProjectPlan(formData: FormData): Promise<void> {
  const parsed = parseAiProjectWorkflowForm(formData);

  if (parsed.kind === 'invalid') {
    redirect(`${aiCenterPath}?error=1`);
  }

  const { database } = await getAdminActionContext();
  const result = await runProjectWorkflow(database, parsed.value.projectId);

  refreshAiResources();
  redirect(`${aiCenterPath}?${result === 'completed' ? 'success' : 'error'}=1`);
}

export async function runAiKnowledgeDraft(formData: FormData): Promise<void> {
  const parsed = parseAiKnowledgeWorkflowForm(formData);

  if (parsed.kind === 'invalid') {
    redirect(`${aiCenterPath}?error=1`);
  }

  const { database } = await getAdminActionContext();
  const result = await runKnowledgeWorkflow(database, parsed.value.projectId);

  refreshAiResources();
  redirect(`${aiCenterPath}?${result === 'completed' ? 'success' : 'error'}=1`);
}

export async function approveAiProjectPlan(formData: FormData): Promise<void> {
  const parsed = parseAiProjectPlanApprovalForm(formData);

  if (parsed.kind === 'invalid') {
    redirect(`${aiCenterPath}?error=1`);
  }

  const { database } = await getAdminActionContext();
  const plan = await database.aiProjectPlan.findUnique({ where: { id: parsed.value.id } });

  if (plan === null || plan.status !== 'DRAFT') {
    redirect(`${aiCenterPath}?error=1`);
  }

  await database.$transaction(async (transaction) => {
    await transaction.crmTask.createMany({
      data: plan.tasks.map((title) => ({ projectId: plan.projectId, title })),
    });
    await transaction.aiProjectPlan.update({
      data: { status: 'APPROVED' },
      where: { id: plan.id },
    });
  });
  await recordAdminActivity({
    action: 'approve',
    resource: 'ai_project_plan',
    resourceId: plan.id,
    summary: '确认 AI 项目任务计划并创建 CRM 任务',
  });
  refreshAiResources();
  redirect(`${aiCenterPath}?success=1`);
}

export async function createBlogDraftFromAiContent(formData: FormData): Promise<void> {
  const parsed = parseAiContentDraftReviewForm(formData);

  if (parsed.kind === 'invalid') {
    redirect(`${aiCenterPath}?error=1`);
  }

  const { database } = await getAdminActionContext();
  const draft = await database.aiContentDraft.findUnique({ where: { id: parsed.value.id } });

  if (draft === null || draft.status !== AiContentDraftStatus.DRAFT) {
    redirect(`${aiCenterPath}?error=1`);
  }

  const post = await database.$transaction(async (transaction) => {
    const createdPost = await transaction.post.create({
      data: {
        category: 'ai',
        content: formatAiContentDraftAsMarkdown(draft),
        description: draft.seoDescription,
        keywords: [draft.topic],
        locale: 'zh-CN',
        published: false,
        seoDescription: draft.seoDescription,
        seoTitle: draft.title,
        slug: `ai-draft-${draft.id}`,
        tags: ['AI', '内容草稿'],
        title: draft.title,
      },
    });

    await transaction.aiContentDraft.update({
      data: { status: AiContentDraftStatus.REVIEWED },
      where: { id: draft.id },
    });

    return createdPost;
  });
  await recordAdminActivity({
    action: 'create',
    resource: 'post',
    resourceId: post.id,
    summary: '已将 AI 内容建议转为未发布文章草稿',
  });
  refreshAiResources();
  revalidatePath('/admin/blog');
  redirect('/admin/blog?success=1');
}

function formatAiContentDraftAsMarkdown(
  draft: Readonly<{
    readonly outline: readonly string[];
    readonly seoDescription: string;
    readonly title: string;
    readonly topic: string;
    readonly videoScript: string;
    readonly xiaohongshuDirection: string;
  }>,
): string {
  return [
    `# ${draft.title}`,
    '',
    draft.seoDescription,
    '',
    '## 写作大纲',
    '',
    ...draft.outline.map((item) => `- ${item}`),
    '',
    '## 小红书方向（待人工改写）',
    '',
    draft.xiaohongshuDirection,
    '',
    '## 视频脚本方向（待人工改写）',
    '',
    draft.videoScript,
    '',
    `> AI 草稿主题：${draft.topic}。请在发布前补充真实案例、技术细节、图片说明与引用来源。`,
  ].join('\n');
}

function refreshAiResources(): void {
  for (const path of [
    aiCenterPath,
    '/admin/ai/logs',
    '/admin/ai/prompts',
    '/admin/ai/settings',
    '/admin/crm/dashboard',
    '/admin/crm/leads',
    '/admin/crm/projects',
    '/admin/crm/tasks',
    '/admin/knowledge',
    '/admin/blog',
  ]) {
    revalidatePath(path);
  }
}
