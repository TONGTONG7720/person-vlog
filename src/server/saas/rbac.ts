export const saasRoles = [
  'OWNER',
  'ADMIN',
  'ENTERPRISE_OWNER',
  'SECURITY_ADMIN',
  'DEPARTMENT_ADMIN',
  'MEMBER',
  'VIEWER',
] as const;

export type SaasRole = (typeof saasRoles)[number];

export const saasPermissions = {
  agentExecute: 'agent.execute',
  agentRead: 'agent.read',
  aiManage: 'ai.manage',
  aiUse: 'ai.use',
  apiManage: 'api.manage',
  auditRead: 'audit.read',
  billingManage: 'billing.manage',
  departmentManage: 'department.manage',
  documentRead: 'document.read',
  documentWrite: 'document.write',
  enterpriseManage: 'enterprise.manage',
  fileDelete: 'file.delete',
  fileRead: 'file.read',
  fileWrite: 'file.write',
  marketplaceManage: 'marketplace.manage',
  marketplacePublish: 'marketplace.publish',
  memberManage: 'member.manage',
  projectDelete: 'project.delete',
  projectRead: 'project.read',
  projectWrite: 'project.write',
  securityManage: 'security.manage',
  ssoManage: 'sso.manage',
  taskAssign: 'task.assign',
} as const;

export type SaasPermission = (typeof saasPermissions)[keyof typeof saasPermissions];

const ownerPermissions = Object.values(saasPermissions);

const rolePermissions: Readonly<Record<SaasRole, readonly SaasPermission[]>> = {
  ADMIN: [
    saasPermissions.agentExecute,
    saasPermissions.agentRead,
    saasPermissions.aiManage,
    saasPermissions.aiUse,
    saasPermissions.apiManage,
    saasPermissions.auditRead,
    saasPermissions.documentRead,
    saasPermissions.documentWrite,
    saasPermissions.fileDelete,
    saasPermissions.fileRead,
    saasPermissions.fileWrite,
    saasPermissions.marketplaceManage,
    saasPermissions.marketplacePublish,
    saasPermissions.memberManage,
    saasPermissions.projectDelete,
    saasPermissions.projectRead,
    saasPermissions.projectWrite,
    saasPermissions.taskAssign,
  ],
  DEPARTMENT_ADMIN: [
    saasPermissions.agentExecute,
    saasPermissions.agentRead,
    saasPermissions.aiManage,
    saasPermissions.aiUse,
    saasPermissions.documentRead,
    saasPermissions.documentWrite,
    saasPermissions.memberManage,
    saasPermissions.projectRead,
    saasPermissions.projectWrite,
    saasPermissions.taskAssign,
  ],
  ENTERPRISE_OWNER: ownerPermissions,
  MEMBER: [
    saasPermissions.agentExecute,
    saasPermissions.agentRead,
    saasPermissions.aiUse,
    saasPermissions.documentRead,
    saasPermissions.documentWrite,
    saasPermissions.fileRead,
    saasPermissions.fileWrite,
    saasPermissions.marketplacePublish,
    saasPermissions.projectRead,
    saasPermissions.projectWrite,
  ],
  OWNER: ownerPermissions,
  SECURITY_ADMIN: [
    saasPermissions.agentRead,
    saasPermissions.apiManage,
    saasPermissions.auditRead,
    saasPermissions.documentRead,
    saasPermissions.securityManage,
    saasPermissions.ssoManage,
  ],
  VIEWER: [
    saasPermissions.agentRead,
    saasPermissions.aiUse,
    saasPermissions.documentRead,
    saasPermissions.fileRead,
    saasPermissions.projectRead,
  ],
};

export function hasSaasPermission(role: SaasRole, permission: SaasPermission): boolean {
  return rolePermissions[role].includes(permission);
}

export function tenantKnowledgeNamespace(
  input: Readonly<{
    readonly enterpriseId: string;
    readonly organizationId: string;
    readonly workspaceId: string;
  }>,
): string {
  return `enterprise:${input.enterpriseId}:org:${input.organizationId}:workspace:${input.workspaceId}`;
}
