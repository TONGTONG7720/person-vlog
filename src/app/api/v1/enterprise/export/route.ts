import { requireSaasPermission } from '@/server/saas/auth';
import { requireCmsDatabase } from '@/server/cms/database';
import { writeEnterpriseAuditLog } from '@/server/enterprise/audit';
import { getSaasApiContext, saasApiErrorResponse } from '@/server/saas/api';
import { saasPermissions } from '@/server/saas/rbac';

export const runtime = 'nodejs';

export async function GET(request: Request): Promise<Response> {
  const contextResult = await getSaasApiContext(request);

  if (contextResult.kind === 'unauthorized') {
    return contextResult.response;
  }

  try {
    requireSaasPermission(contextResult.context, saasPermissions.enterpriseManage);
    const database = requireCmsDatabase();
    const enterpriseId = contextResult.context.enterprise.id;
    const organizationId = contextResult.context.organization.id;
    const [members, projects, documents, knowledgeDocuments] = await Promise.all([
      database.membership.findMany({
        include: {
          department: { select: { name: true } },
          role: { select: { key: true, name: true } },
          user: { select: { email: true } },
        },
        where: { enterpriseId, organizationId },
      }),
      database.workspaceProject.findMany({
        include: { workspace: { select: { name: true, slug: true } } },
        where: { enterpriseId, organizationId },
      }),
      database.projectDocument.findMany({
        select: {
          content: true,
          contentType: true,
          createdAt: true,
          kind: true,
          title: true,
          updatedAt: true,
        },
        where: { enterpriseId, organizationId },
      }),
      database.aiKnowledgeDocument.findMany({
        select: {
          content: true,
          createdAt: true,
          sourceType: true,
          status: true,
          title: true,
          updatedAt: true,
        },
        where: { enterpriseId, organizationId },
      }),
    ]);
    await writeEnterpriseAuditLog({
      action: 'enterprise.data_exported',
      enterpriseId,
      organizationId,
      resource: 'enterprise_data_export',
      userId: contextResult.context.user.id,
    });

    return new Response(
      JSON.stringify({
        exportedAt: new Date().toISOString(),
        organization: contextResult.context.organization,
        data: { documents, knowledgeDocuments, members, projects },
      }),
      {
        headers: {
          'Cache-Control': 'private, no-store',
          'Content-Disposition': 'attachment; filename="enterprise-data-export.json"',
          'Content-Type': 'application/json; charset=utf-8',
        },
      },
    );
  } catch (error) {
    return saasApiErrorResponse(error);
  }
}
