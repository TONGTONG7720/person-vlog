import { ProjectActivityType } from '@/generated/prisma/client';
import { assertEnterpriseResourcePermission } from '@/server/enterprise/access';
import { requireCmsDatabase } from '@/server/cms/database';
import { requireSaasPermission, type SaasContext } from '@/server/saas/auth';
import { requirePlanLimit } from '@/server/saas/billing/entitlements';
import { SaasResourceNotFoundError } from '@/server/saas/project-errors';
import { recordProjectMutation } from '@/server/saas/project-mutations';
import { saasPermissions } from '@/server/saas/rbac';
import { tenantProjectWhere } from '@/server/saas/scoping';
import type { CreateWorkspaceInput, CreateWorkspaceProjectInput } from '@/server/saas/validation';

export async function getSaasPortalProjects(context: SaasContext) {
  requireSaasPermission(context, saasPermissions.projectRead);
  const database = requireCmsDatabase();

  return database.workspaceProject.findMany({
    include: {
      _count: { select: { documents: true, tasks: true } },
      workspace: { select: { name: true, slug: true } },
    },
    orderBy: { updatedAt: 'desc' },
    take: 40,
    where: { enterpriseId: context.enterprise.id, organizationId: context.organization.id },
  });
}

export async function getSaasProjectWorkspace(context: SaasContext, projectId: string) {
  await assertEnterpriseResourcePermission(context, {
    permissionKey: saasPermissions.projectRead,
    resourceId: projectId,
    resourceType: 'workspace_project',
  });
  const database = requireCmsDatabase();

  return database.workspaceProject.findFirst({
    include: {
      activities: {
        include: { actor: { include: { user: { select: { email: true } } } } },
        orderBy: { createdAt: 'desc' },
        take: 16,
      },
      documents: { orderBy: { updatedAt: 'desc' }, take: 30 },
      owner: { include: { user: { select: { email: true } } } },
      tasks: {
        include: { assignee: { include: { user: { select: { email: true } } } } },
        orderBy: [{ status: 'asc' }, { updatedAt: 'desc' }],
        take: 100,
      },
      workspace: { select: { id: true, name: true, slug: true } },
    },
    where: tenantProjectWhere({
      enterpriseId: context.enterprise.id,
      organizationId: context.organization.id,
      projectId,
    }),
  });
}

export async function createSaasWorkspace(
  context: SaasContext,
  input: Omit<CreateWorkspaceInput, 'organizationId'>,
) {
  requireSaasPermission(context, saasPermissions.memberManage);
  const database = requireCmsDatabase();
  const workspaceCount = await database.workspace.count({
    where: { enterpriseId: context.enterprise.id, organizationId: context.organization.id },
  });

  await requirePlanLimit(context, 'workspaces', workspaceCount);

  return database.workspace.create({
    data: {
      departmentId: context.membership.departmentId,
      enterpriseId: context.enterprise.id,
      name: input.name,
      organizationId: context.organization.id,
      slug: input.slug,
    },
  });
}

export async function createSaasWorkspaceProject(
  context: SaasContext,
  input: CreateWorkspaceProjectInput,
) {
  requireSaasPermission(context, saasPermissions.projectWrite);
  const database = requireCmsDatabase();
  const workspace = await database.workspace.findFirst({
    select: { id: true },
    where: {
      enterpriseId: context.enterprise.id,
      id: input.workspaceId,
      organizationId: context.organization.id,
    },
  });

  if (workspace === null) {
    throw new SaasResourceNotFoundError();
  }

  const projectCount = await database.workspaceProject.count({
    where: { enterpriseId: context.enterprise.id, organizationId: context.organization.id },
  });

  await requirePlanLimit(context, 'projects', projectCount);

  const project = await database.workspaceProject.create({
    data: {
      ...(input.description === undefined ? {} : { description: input.description }),
      enterpriseId: context.enterprise.id,
      organizationId: context.organization.id,
      ownerMembershipId: context.membership.id,
      title: input.title,
      workspaceId: workspace.id,
    },
  });

  await recordProjectMutation({
    action: 'project.created',
    activityType: ProjectActivityType.PROJECT_CREATED,
    content: `创建项目「${project.title}」`,
    context,
    projectId: project.id,
  });

  return project;
}
