import { writeEnterpriseAuditLog } from '@/server/enterprise/audit';
import { requireCmsDatabase } from '@/server/cms/database';
import { requireSaasPermission, type SaasContext } from '@/server/saas/auth';
import { saasPermissions } from '@/server/saas/rbac';

export async function getEnterpriseDepartments(context: SaasContext) {
  requireSaasPermission(context, saasPermissions.departmentManage);
  const database = requireCmsDatabase();

  return database.department.findMany({
    include: { _count: { select: { memberships: true, workspaces: true } } },
    orderBy: { createdAt: 'asc' },
    where: { enterpriseId: context.enterprise.id, organizationId: context.organization.id },
  });
}

export async function createEnterpriseDepartment(context: SaasContext, name: string) {
  requireSaasPermission(context, saasPermissions.departmentManage);
  const database = requireCmsDatabase();
  const department = await database.department.create({
    data: {
      enterpriseId: context.enterprise.id,
      name,
      organizationId: context.organization.id,
    },
  });

  await writeEnterpriseAuditLog({
    action: 'enterprise.department.created',
    enterpriseId: context.enterprise.id,
    organizationId: context.organization.id,
    resource: 'department',
    resourceId: department.id,
    userId: context.user.id,
  });

  return department;
}
