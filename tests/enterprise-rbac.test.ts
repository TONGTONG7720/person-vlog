import { describe, expect, it } from 'vitest';

async function loadEnterpriseRbac() {
  return import('../src/server/enterprise/rbac').catch(() => undefined);
}

async function loadEnterpriseScoping() {
  return import('../src/server/enterprise/scoping').catch(() => undefined);
}

describe('Enterprise RBAC 与资源隔离', () => {
  it('允许 Enterprise Owner 管理企业安全和账单', async () => {
    const enterpriseRbac = await loadEnterpriseRbac();

    expect(enterpriseRbac).toBeDefined();

    if (enterpriseRbac === undefined) {
      return;
    }

    expect(enterpriseRbac.hasEnterprisePermission('ENTERPRISE_OWNER', 'security.manage')).toBe(
      true,
    );
    expect(enterpriseRbac.hasEnterprisePermission('ENTERPRISE_OWNER', 'billing.manage')).toBe(true);
  });

  it('只允许 Security Admin 管理安全边界，不允许修改账单', async () => {
    const enterpriseRbac = await loadEnterpriseRbac();

    expect(enterpriseRbac).toBeDefined();

    if (enterpriseRbac === undefined) {
      return;
    }

    expect(enterpriseRbac.hasEnterprisePermission('SECURITY_ADMIN', 'audit.read')).toBe(true);
    expect(enterpriseRbac.hasEnterprisePermission('SECURITY_ADMIN', 'security.manage')).toBe(true);
    expect(enterpriseRbac.hasEnterprisePermission('SECURITY_ADMIN', 'billing.manage')).toBe(false);
  });

  it('拒绝相同工作区标识但不同企业的资源访问', async () => {
    const enterpriseScoping = await loadEnterpriseScoping();

    expect(enterpriseScoping).toBeDefined();

    if (enterpriseScoping === undefined) {
      return;
    }

    const context = enterpriseScoping.createEnterpriseScope({
      enterpriseId: 'enterprise-a',
      organizationId: 'organization-a',
      workspaceId: 'workspace-shared',
    });
    const foreignResource = {
      enterpriseId: 'enterprise-b',
      organizationId: 'organization-b',
      workspaceId: 'workspace-shared',
    };

    expect(enterpriseScoping.canAccessEnterpriseResource(context, foreignResource)).toBe(false);
  });

  it('为同一企业的组织和工作区生成组合 Prisma 过滤条件', async () => {
    const enterpriseScoping = await loadEnterpriseScoping();

    expect(enterpriseScoping).toBeDefined();

    if (enterpriseScoping === undefined) {
      return;
    }

    expect(
      enterpriseScoping.enterpriseWorkspaceWhere({
        enterpriseId: 'enterprise-a',
        organizationId: 'organization-a',
        workspaceId: 'workspace-a',
      }),
    ).toEqual({
      enterpriseId: 'enterprise-a',
      organizationId: 'organization-a',
      workspaceId: 'workspace-a',
    });
  });
});
