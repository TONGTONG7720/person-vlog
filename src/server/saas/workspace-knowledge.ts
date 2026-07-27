import { requireCmsDatabase } from '@/server/cms/database';
import type { SaasContext } from '@/server/saas/auth';
import { tenantKnowledgeNamespace } from '@/server/saas/rbac';
import { tenantProjectWhere } from '@/server/saas/scoping';

export async function getProjectKnowledge(context: SaasContext, projectId: string) {
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
    return undefined;
  }

  const namespace = tenantKnowledgeNamespace({
    enterpriseId: context.enterprise.id,
    organizationId: context.organization.id,
    workspaceId: project.workspaceId,
  });
  const documents = await database.workspaceKnowledgeDocument.findMany({
    orderBy: { updatedAt: 'desc' },
    select: { content: true, title: true, updatedAt: true },
    take: 12,
    where: {
      enterpriseId: context.enterprise.id,
      namespace,
      organizationId: context.organization.id,
      projectId: project.id,
      workspaceId: project.workspaceId,
    },
  });

  return { documents, namespace, project };
}
