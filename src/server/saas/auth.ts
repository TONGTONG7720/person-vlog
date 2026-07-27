import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

import { adminAuthOptions, isSaasAuthenticationConfigured } from '@/server/cms/auth';
import { getCmsDatabase } from '@/server/cms/database';
import { hasSaasPermission, type SaasPermission, type SaasRole } from '@/server/saas/rbac';
import { selectSaasOrganizationMembership } from '@/server/saas/organization-selection';

export type SaasContext = Readonly<{
  readonly enterprise: Readonly<{
    readonly id: string;
    readonly name: string;
    readonly status: string;
  }>;
  readonly membership: Readonly<{
    readonly departmentId: string;
    readonly id: string;
    readonly role: SaasRole;
    readonly status: string;
  }>;
  readonly organization: Readonly<{
    readonly id: string;
    readonly name: string;
    readonly slug: string;
  }>;
  readonly organizations: readonly Readonly<{
    readonly id: string;
    readonly name: string;
    readonly slug: string;
  }>[];
  readonly user: Readonly<{
    readonly email: string;
    readonly id: string;
  }>;
}>;

export class SaasPermissionError extends Error {
  public constructor() {
    super('The current membership does not have this permission.');
    this.name = 'SaasPermissionError';
  }
}

export async function getSaasContext(organizationSlug?: string): Promise<SaasContext | undefined> {
  if (!isSaasAuthenticationConfigured()) {
    return undefined;
  }

  const session = await getServerSession(adminAuthOptions);
  const email = session?.user?.email?.toLocaleLowerCase('en-US');
  const database = getCmsDatabase();

  if (email === undefined || database === undefined) {
    return undefined;
  }

  const user = await database.user.findUnique({
    select: { email: true, id: true },
    where: { email },
  });

  if (user === null) {
    return undefined;
  }

  const memberships = await database.membership.findMany({
    include: {
      organization: {
        select: {
          enterprise: { select: { id: true, name: true, status: true } },
          id: true,
          name: true,
          slug: true,
        },
      },
      role: { select: { key: true } },
    },
    orderBy: { createdAt: 'asc' },
    where: { status: 'ACTIVE', userId: user.id },
  });
  const membership = selectSaasOrganizationMembership(memberships, organizationSlug);

  if (
    membership === undefined ||
    membership.enterpriseId !== membership.organization.enterprise.id ||
    membership.organization.enterprise.status !== 'ACTIVE'
  ) {
    return undefined;
  }

  const role = toSaasRole(membership.role.key);

  if (role === undefined) {
    return undefined;
  }

  return {
    enterprise: membership.organization.enterprise,
    membership: {
      departmentId: membership.departmentId,
      id: membership.id,
      role,
      status: membership.status,
    },
    organization: membership.organization,
    organizations: memberships.map((item) => item.organization),
    user,
  };
}

export async function requireSaasContext(organizationSlug?: string): Promise<SaasContext> {
  const context = await getSaasContext(organizationSlug);

  if (context === undefined) {
    redirect('/client/login');
  }

  return context;
}

export function requireSaasPermission(context: SaasContext, permission: SaasPermission): void {
  if (!hasSaasPermission(context.membership.role, permission)) {
    throw new SaasPermissionError();
  }
}

function toSaasRole(value: string): SaasRole | undefined {
  switch (value) {
    case 'OWNER':
      return 'OWNER';
    case 'ADMIN':
      return 'ADMIN';
    case 'ENTERPRISE_OWNER':
      return 'ENTERPRISE_OWNER';
    case 'SECURITY_ADMIN':
      return 'SECURITY_ADMIN';
    case 'DEPARTMENT_ADMIN':
      return 'DEPARTMENT_ADMIN';
    case 'MEMBER':
      return 'MEMBER';
    case 'VIEWER':
      return 'VIEWER';
    default:
      return undefined;
  }
}
