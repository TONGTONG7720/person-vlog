export const enterpriseRoles = [
  'ENTERPRISE_OWNER',
  'SECURITY_ADMIN',
  'DEPARTMENT_ADMIN',
  'MEMBER',
  'VIEWER',
] as const;

export type EnterpriseRole = (typeof enterpriseRoles)[number];

export const enterprisePermissions = {
  agentExecute: 'agent.execute',
  agentRead: 'agent.read',
  apiManage: 'api.manage',
  auditRead: 'audit.read',
  billingManage: 'billing.manage',
  departmentManage: 'department.manage',
  documentRead: 'document.read',
  documentWrite: 'document.write',
  enterpriseManage: 'enterprise.manage',
  memberManage: 'member.manage',
  securityManage: 'security.manage',
  ssoManage: 'sso.manage',
} as const;

export type EnterprisePermission =
  (typeof enterprisePermissions)[keyof typeof enterprisePermissions];

const enterpriseRolePermissions: Readonly<Record<EnterpriseRole, readonly EnterprisePermission[]>> =
  {
    DEPARTMENT_ADMIN: [
      enterprisePermissions.agentExecute,
      enterprisePermissions.agentRead,
      enterprisePermissions.documentRead,
      enterprisePermissions.documentWrite,
      enterprisePermissions.memberManage,
    ],
    ENTERPRISE_OWNER: Object.values(enterprisePermissions),
    MEMBER: [
      enterprisePermissions.agentExecute,
      enterprisePermissions.agentRead,
      enterprisePermissions.documentRead,
      enterprisePermissions.documentWrite,
    ],
    SECURITY_ADMIN: [
      enterprisePermissions.apiManage,
      enterprisePermissions.auditRead,
      enterprisePermissions.documentRead,
      enterprisePermissions.securityManage,
      enterprisePermissions.ssoManage,
    ],
    VIEWER: [enterprisePermissions.agentRead, enterprisePermissions.documentRead],
  };

export function hasEnterprisePermission(
  role: EnterpriseRole,
  permission: EnterprisePermission,
): boolean {
  return enterpriseRolePermissions[role].includes(permission);
}

export function isEnterpriseRole(value: string): value is EnterpriseRole {
  return enterpriseRoles.some((role) => role === value);
}
