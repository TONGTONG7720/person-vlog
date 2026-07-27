import {
  ProjectActivityType,
  ProjectTaskPriority,
  ProjectTaskStatus,
} from '@/generated/prisma/client';
import { requireCmsDatabase } from '@/server/cms/database';
import { requireSaasPermission, type SaasContext } from '@/server/saas/auth';
import { SaasResourceNotFoundError } from '@/server/saas/project-errors';
import { recordProjectMutation } from '@/server/saas/project-mutations';
import { saasPermissions } from '@/server/saas/rbac';
import { tenantProjectWhere } from '@/server/saas/scoping';
import type { CreateProjectTaskInput } from '@/server/saas/validation';

type UpdateProjectTaskStatusInput = Readonly<{
  readonly projectId: string;
  readonly status: keyof typeof ProjectTaskStatus;
  readonly taskId: string;
}>;

export async function createSaasProjectTask(
  context: SaasContext,
  projectId: string,
  input: Omit<CreateProjectTaskInput, 'organizationId' | 'projectId'>,
) {
  requireSaasPermission(context, saasPermissions.projectWrite);
  const database = requireCmsDatabase();
  const project = await database.workspaceProject.findFirst({
    select: { id: true, workspaceId: true },
    where: tenantProjectWhere({
      enterpriseId: context.enterprise.id,
      organizationId: context.organization.id,
      projectId,
    }),
  });

  if (project === null) {
    throw new SaasResourceNotFoundError();
  }

  if (input.assigneeMembershipId !== undefined) {
    requireSaasPermission(context, saasPermissions.taskAssign);
    const assignee = await database.membership.findFirst({
      select: { id: true },
      where: {
        enterpriseId: context.enterprise.id,
        id: input.assigneeMembershipId,
        organizationId: context.organization.id,
        status: 'ACTIVE',
      },
    });

    if (assignee === null) {
      throw new SaasResourceNotFoundError();
    }
  }

  const task = await database.projectTask.create({
    data: {
      ...(input.assigneeMembershipId === undefined
        ? {}
        : { assigneeMembershipId: input.assigneeMembershipId }),
      ...(input.description === undefined ? {} : { description: input.description }),
      ...(input.dueDate === undefined ? {} : { dueDate: input.dueDate }),
      enterpriseId: context.enterprise.id,
      organizationId: context.organization.id,
      priority: ProjectTaskPriority[input.priority],
      projectId: project.id,
      status: ProjectTaskStatus[input.status],
      title: input.title,
      workspaceId: project.workspaceId,
    },
  });

  await recordProjectMutation({
    action: 'task.created',
    activityType: ProjectActivityType.TASK_CREATED,
    content: `创建任务「${task.title}」`,
    context,
    projectId: project.id,
  });

  return task;
}

export async function updateSaasProjectTaskStatus(
  context: SaasContext,
  input: UpdateProjectTaskStatusInput,
): Promise<void> {
  requireSaasPermission(context, saasPermissions.projectWrite);
  const database = requireCmsDatabase();
  const task = await database.projectTask.findFirst({
    select: { id: true, title: true },
    where: {
      enterpriseId: context.enterprise.id,
      id: input.taskId,
      organizationId: context.organization.id,
      projectId: input.projectId,
    },
  });

  if (task === null) {
    throw new SaasResourceNotFoundError();
  }

  await database.projectTask.update({
    data: { status: ProjectTaskStatus[input.status] },
    where: { id: task.id },
  });
  await recordProjectMutation({
    action: 'task.updated',
    activityType: ProjectActivityType.TASK_UPDATED,
    content: `更新任务「${task.title}」状态`,
    context,
    projectId: input.projectId,
  });
}
