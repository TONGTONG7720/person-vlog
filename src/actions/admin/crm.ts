'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { LeadActivityType, LeadStatus } from '@/generated/prisma/client';
import { recordAdminActivity } from '@/server/cms/activity';
import { getAdminActionContext } from '@/actions/admin/action-utils';
import { sendProjectUpdateNotification } from '@/server/crm/email';
import { calculateLeadScore, createLeadTags, inferLeadPriority } from '@/server/crm/lead-scoring';
import {
  crmLeadActivityTypeToPrisma,
  crmLeadPriorityToPrisma,
  crmLeadStatusFromPrisma,
  crmLeadStatusToPrisma,
  crmProjectStatusToPrisma,
  crmProposalStatusToPrisma,
  crmTaskStatusToPrisma,
} from '@/server/crm/mappings';
import {
  getCrmResourceId,
  parseCrmAutomationRuleForm,
  parseCrmCreateLeadForm,
  parseCrmCreateProjectForm,
  parseCrmCreateProposalForm,
  parseCrmCreateTaskForm,
  parseCrmLeadActivityForm,
  parseCrmLeadStatusForm,
  parseCrmProjectStatusForm,
  parseCrmProposalStatusForm,
  parseCrmTaskStatusForm,
} from '@/server/crm/validation';
import { crmLeadStatusLabels, crmProjectStatusLabels, type CrmLeadStatus } from '@/types/crm';

type CrmActionResult = Readonly<{ readonly kind: 'error' | 'success' }>;

const crmBasePath = '/admin/crm';

export async function createCrmLead(formData: FormData): Promise<void> {
  const parsed = parseCrmCreateLeadForm(formData);

  if (parsed.kind === 'invalid') {
    redirect(`${crmBasePath}/leads?error=1`);
  }

  const { database } = await getAdminActionContext();
  const scoringInput = {
    ...(parsed.value.budget === undefined ? {} : { budget: parsed.value.budget }),
    ...(parsed.value.company === undefined ? {} : { company: parsed.value.company }),
    ...(parsed.value.service === undefined ? {} : { service: parsed.value.service }),
    ...(parsed.value.source === undefined ? {} : { source: parsed.value.source }),
    ...(parsed.value.timeline === undefined ? {} : { timeline: parsed.value.timeline }),
  };
  const score = calculateLeadScore(scoringInput);
  const priority = parsed.value.priority ?? inferLeadPriority(score);
  const lead = await database.lead.create({
    data: {
      email: parsed.value.email,
      name: parsed.value.name,
      notes: parsed.value.notes ?? null,
      priority: crmLeadPriorityToPrisma[priority],
      score,
      service: parsed.value.service ?? null,
      source: parsed.value.source ?? null,
      status: LeadStatus.NEW,
      tags: parsed.value.tags.length > 0 ? parsed.value.tags : [...createLeadTags(scoringInput)],
      ...(parsed.value.budget === undefined ? {} : { budget: parsed.value.budget }),
      ...(parsed.value.company === undefined ? {} : { company: parsed.value.company }),
      ...(parsed.value.timeline === undefined ? {} : { timeline: parsed.value.timeline }),
    },
  });
  await database.leadActivity.create({
    data: {
      content: '由管理员手动创建线索',
      leadId: lead.id,
      type: LeadActivityType.STATUS_CHANGE,
    },
  });
  await recordAdminActivity({
    action: 'create',
    resource: 'crm_lead',
    resourceId: lead.id,
    summary: '创建 CRM 线索',
  });
  refreshCrmPaths();
  redirect(`${crmBasePath}/leads?success=1`);
}

export async function moveCrmLead(
  input: Readonly<{
    readonly leadId: string;
    readonly status: CrmLeadStatus;
  }>,
): Promise<CrmActionResult> {
  const formData = new FormData();
  formData.set('id', input.leadId);
  formData.set('status', input.status);
  const parsed = parseCrmLeadStatusForm(formData);

  if (parsed.kind === 'invalid') {
    return { kind: 'error' };
  }

  await updateLeadStatus(parsed.value.id, parsed.value.status);
  refreshCrmPaths();

  return { kind: 'success' };
}

export async function updateCrmLeadStatus(formData: FormData): Promise<void> {
  const parsed = parseCrmLeadStatusForm(formData);

  if (parsed.kind === 'invalid') {
    redirect(`${crmBasePath}/leads?error=1`);
  }

  await updateLeadStatus(parsed.value.id, parsed.value.status);
  refreshCrmPaths();
  redirect(`${crmBasePath}/leads/${parsed.value.id}?success=1`);
}

export async function addCrmLeadActivity(formData: FormData): Promise<void> {
  const parsed = parseCrmLeadActivityForm(formData);

  if (parsed.kind === 'invalid') {
    redirect(`${crmBasePath}/leads?error=1`);
  }

  const { database } = await getAdminActionContext();
  await database.leadActivity.create({
    data: {
      content: parsed.value.content,
      leadId: parsed.value.leadId,
      type: crmLeadActivityTypeToPrisma[parsed.value.type],
    },
  });
  await recordAdminActivity({
    action: 'create',
    resource: 'crm_lead_activity',
    resourceId: parsed.value.leadId,
    summary: '记录 CRM 跟进活动',
  });
  refreshCrmPaths();
  redirect(`${crmBasePath}/leads/${parsed.value.leadId}?success=1`);
}

export async function createCrmTask(formData: FormData): Promise<void> {
  const parsed = parseCrmCreateTaskForm(formData);

  if (parsed.kind === 'invalid') {
    redirect(`${crmBasePath}/tasks?error=1`);
  }

  const { database } = await getAdminActionContext();
  await database.crmTask.create({
    data: {
      title: parsed.value.title,
      ...(parsed.value.dueDate === undefined ? {} : { dueDate: parsed.value.dueDate }),
      ...(parsed.value.leadId === undefined ? {} : { leadId: parsed.value.leadId }),
    },
  });
  await recordAdminActivity({
    action: 'create',
    resource: 'crm_task',
    summary: '创建 CRM 跟进任务',
  });
  refreshCrmPaths();
  redirect(`${crmBasePath}/tasks?success=1`);
}

export async function updateCrmTaskStatus(formData: FormData): Promise<void> {
  const parsed = parseCrmTaskStatusForm(formData);

  if (parsed.kind === 'invalid') {
    redirect(`${crmBasePath}/tasks?error=1`);
  }

  const { database } = await getAdminActionContext();
  await database.crmTask.update({
    data: { status: crmTaskStatusToPrisma[parsed.value.status] },
    where: { id: parsed.value.id },
  });
  await recordAdminActivity({
    action: 'update',
    resource: 'crm_task',
    resourceId: parsed.value.id,
    summary: '更新 CRM 任务状态',
  });
  refreshCrmPaths();
  redirect(`${crmBasePath}/tasks?success=1`);
}

export async function createCrmProject(formData: FormData): Promise<void> {
  const parsed = parseCrmCreateProjectForm(formData);

  if (parsed.kind === 'invalid') {
    redirect(`${crmBasePath}/projects?error=1`);
  }

  const { database } = await getAdminActionContext();
  await database.crmProject.create({
    data: {
      title: parsed.value.title,
      ...(parsed.value.description === undefined ? {} : { description: parsed.value.description }),
      ...(parsed.value.dueDate === undefined ? {} : { dueDate: parsed.value.dueDate }),
      ...(parsed.value.leadId === undefined ? {} : { leadId: parsed.value.leadId }),
    },
  });
  await recordAdminActivity({
    action: 'create',
    resource: 'crm_project',
    summary: '创建 CRM 客户项目',
  });
  refreshCrmPaths();
  redirect(`${crmBasePath}/projects?success=1`);
}

export async function updateCrmProjectStatus(formData: FormData): Promise<void> {
  const parsed = parseCrmProjectStatusForm(formData);

  if (parsed.kind === 'invalid') {
    redirect(`${crmBasePath}/projects?error=1`);
  }

  const { database } = await getAdminActionContext();
  const project = await database.crmProject.update({
    data: { status: crmProjectStatusToPrisma[parsed.value.status] },
    include: { lead: { select: { email: true, name: true } } },
    where: { id: parsed.value.id },
  });

  if (project.lead !== null) {
    await sendProjectUpdateNotification({
      email: project.lead.email,
      name: project.lead.name,
      projectTitle: project.title,
      statusLabel: crmProjectStatusLabels[parsed.value.status],
    });
  }

  await recordAdminActivity({
    action: 'update',
    resource: 'crm_project',
    resourceId: parsed.value.id,
    summary: '更新 CRM 客户项目状态',
  });
  refreshCrmPaths();
  redirect(`${crmBasePath}/projects?success=1`);
}

export async function createCrmProposal(formData: FormData): Promise<void> {
  const parsed = parseCrmCreateProposalForm(formData);

  if (parsed.kind === 'invalid') {
    redirect(`${crmBasePath}/leads?error=1`);
  }

  const { database } = await getAdminActionContext();
  const proposal = await database.proposal.create({
    data: {
      content: parsed.value.content,
      leadId: parsed.value.leadId,
      title: parsed.value.title,
    },
  });
  await recordAdminActivity({
    action: 'create',
    resource: 'crm_proposal',
    resourceId: proposal.id,
    summary: '创建 CRM 方案或报价',
  });
  refreshCrmPaths();
  redirect(`${crmBasePath}/leads/${parsed.value.leadId}?success=1`);
}

export async function updateCrmProposalStatus(formData: FormData): Promise<void> {
  const parsed = parseCrmProposalStatusForm(formData);

  if (parsed.kind === 'invalid') {
    redirect(`${crmBasePath}/leads?error=1`);
  }

  const { database } = await getAdminActionContext();
  const proposal = await database.proposal.update({
    data: { status: crmProposalStatusToPrisma[parsed.value.status] },
    select: { leadId: true },
    where: { id: parsed.value.id },
  });
  await recordAdminActivity({
    action: 'update',
    resource: 'crm_proposal',
    resourceId: parsed.value.id,
    summary: '更新 CRM 方案或报价状态',
  });
  refreshCrmPaths();
  redirect(`${crmBasePath}/leads/${proposal.leadId}?success=1`);
}

export async function updateCrmAutomationRule(formData: FormData): Promise<void> {
  const parsed = parseCrmAutomationRuleForm(formData);

  if (parsed.kind === 'invalid') {
    redirect(`${crmBasePath}/settings?error=1`);
  }

  const { database } = await getAdminActionContext();
  await database.automationRule.update({
    data: { enabled: parsed.value.enabled },
    where: { id: parsed.value.id },
  });
  await recordAdminActivity({
    action: 'update',
    resource: 'crm_automation_rule',
    resourceId: parsed.value.id,
    summary: '更新 CRM 自动化规则',
  });
  refreshCrmPaths();
  redirect(`${crmBasePath}/settings?success=1`);
}

export async function deleteCrmLead(formData: FormData): Promise<void> {
  const id = getCrmResourceId(formData);

  if (id === undefined) {
    redirect(`${crmBasePath}/leads?error=1`);
  }

  const { database } = await getAdminActionContext();
  await database.lead.delete({ where: { id } });
  await recordAdminActivity({
    action: 'delete',
    resource: 'crm_lead',
    resourceId: id,
    summary: '删除 CRM 线索',
  });
  refreshCrmPaths();
  redirect(`${crmBasePath}/leads?success=1`);
}

export async function deleteCrmTask(formData: FormData): Promise<void> {
  const id = getCrmResourceId(formData);

  if (id === undefined) {
    redirect(`${crmBasePath}/tasks?error=1`);
  }

  const { database } = await getAdminActionContext();
  await database.crmTask.delete({ where: { id } });
  await recordAdminActivity({
    action: 'delete',
    resource: 'crm_task',
    resourceId: id,
    summary: '删除 CRM 任务',
  });
  refreshCrmPaths();
  redirect(`${crmBasePath}/tasks?success=1`);
}

export async function deleteCrmProject(formData: FormData): Promise<void> {
  const id = getCrmResourceId(formData);

  if (id === undefined) {
    redirect(`${crmBasePath}/projects?error=1`);
  }

  const { database } = await getAdminActionContext();
  await database.crmProject.delete({ where: { id } });
  await recordAdminActivity({
    action: 'delete',
    resource: 'crm_project',
    resourceId: id,
    summary: '删除 CRM 客户项目',
  });
  refreshCrmPaths();
  redirect(`${crmBasePath}/projects?success=1`);
}

async function updateLeadStatus(id: string, status: CrmLeadStatus): Promise<void> {
  const { database } = await getAdminActionContext();
  const lead = await database.lead.update({
    data: { status: crmLeadStatusToPrisma[status] },
    where: { id },
  });
  await database.leadActivity.create({
    data: {
      content: `状态更新为「${crmLeadStatusLabels[status]}」`,
      leadId: lead.id,
      type: LeadActivityType.STATUS_CHANGE,
    },
  });

  if (lead.status === LeadStatus.WON) {
    const existingProject = await database.crmProject.findFirst({
      select: { id: true },
      where: { leadId: lead.id },
    });

    if (existingProject === null) {
      await database.crmProject.create({
        data: {
          leadId: lead.id,
          title: `${lead.company ?? lead.name} 的${lead.service ?? '合作'}项目`,
        },
      });
    }
  }

  await recordAdminActivity({
    action: 'update',
    resource: 'crm_lead',
    resourceId: lead.id,
    summary: `更新 CRM 线索状态为${crmLeadStatusLabels[crmLeadStatusFromPrisma[lead.status]]}`,
  });
}

function refreshCrmPaths(): void {
  for (const path of [
    '/admin/dashboard',
    '/admin/crm/dashboard',
    '/admin/crm/leads',
    '/admin/crm/projects',
    '/admin/crm/tasks',
    '/admin/crm/settings',
  ]) {
    revalidatePath(path);
  }
}
