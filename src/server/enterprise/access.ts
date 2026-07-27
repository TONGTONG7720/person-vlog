import { requireCmsDatabase } from '@/server/cms/database';
import { type SaasContext, SaasPermissionError } from '@/server/saas/auth';
import { hasSaasPermission, type SaasPermission } from '@/server/saas/rbac';

type EnterpriseResourcePermissionInput = Readonly<{
  readonly permissionKey: SaasPermission;
  readonly resourceId: string;
  readonly resourceType: string;
}>;

type GrantEnterpriseResourcePermissionInput = EnterpriseResourcePermissionInput &
  Readonly<{
    readonly expiresAt?: Date;
    readonly membershipId: string;
  }>;

export async function assertEnterpriseResourcePermission(
  context: SaasContext,
  input: EnterpriseResourcePermissionInput,
): Promise<void> {
  if (hasSaasPermission(context.membership.role, input.permissionKey)) {
    return;
  }

  const database = requireCmsDatabase();
  const grant = await database.resourcePermissionGrant.findFirst({
    select: { id: true },
    where: {
      enterpriseId: context.enterprise.id,
      membershipId: context.membership.id,
      organizationId: context.organization.id,
      permission: { key: input.permissionKey },
      resourceId: input.resourceId,
      resourceType: input.resourceType,
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
    },
  });

  if (grant === null) {
    throw new SaasPermissionError();
  }
}

export async function grantEnterpriseResourcePermission(
  context: SaasContext,
  input: GrantEnterpriseResourcePermissionInput,
): Promise<void> {
  if (
    !hasSaasPermission(context.membership.role, 'enterprise.manage') &&
    !hasSaasPermission(context.membership.role, 'department.manage')
  ) {
    throw new SaasPermissionError();
  }

  const database = requireCmsDatabase();
  const [membership, permission] = await Promise.all([
    database.membership.findFirst({
      select: { id: true },
      where: {
        enterpriseId: context.enterprise.id,
        id: input.membershipId,
        organizationId: context.organization.id,
        status: 'ACTIVE',
      },
    }),
    database.permission.findUnique({
      select: { id: true },
      where: { key: input.permissionKey },
    }),
  ]);

  if (membership === null || permission === null) {
    throw new SaasPermissionError();
  }

  await database.resourcePermissionGrant.upsert({
    create: {
      createdByMembershipId: context.membership.id,
      enterpriseId: context.enterprise.id,
      ...(input.expiresAt === undefined ? {} : { expiresAt: input.expiresAt }),
      membershipId: input.membershipId,
      organizationId: context.organization.id,
      permissionId: permission.id,
      resourceId: input.resourceId,
      resourceType: input.resourceType,
    },
    update: {
      ...(input.expiresAt === undefined ? {} : { expiresAt: input.expiresAt }),
      createdByMembershipId: context.membership.id,
    },
    where: {
      membershipId_permissionId_resourceType_resourceId: {
        membershipId: input.membershipId,
        permissionId: permission.id,
        resourceId: input.resourceId,
        resourceType: input.resourceType,
      },
    },
  });
}
