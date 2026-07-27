import { describe, expect, it } from 'vitest';

import {
  hasSaasPermission,
  saasPermissions,
  tenantKnowledgeNamespace,
} from '../src/server/saas/rbac';

describe('SaaS RBAC 与租户知识库隔离', () => {
  it('允许 Owner 管理所有组织内资源', () => {
    expect(hasSaasPermission('OWNER', saasPermissions.billingManage)).toBe(true);
    expect(hasSaasPermission('OWNER', saasPermissions.projectDelete)).toBe(true);
  });

  it('允许 Admin 管理成员但不能管理订阅', () => {
    expect(hasSaasPermission('ADMIN', saasPermissions.memberManage)).toBe(true);
    expect(hasSaasPermission('ADMIN', saasPermissions.billingManage)).toBe(false);
  });

  it('不允许 Member 删除项目或管理成员', () => {
    expect(hasSaasPermission('MEMBER', saasPermissions.projectDelete)).toBe(false);
    expect(hasSaasPermission('MEMBER', saasPermissions.memberManage)).toBe(false);
  });

  it('为不同工作区生成不可混用的知识命名空间', () => {
    const firstNamespace = tenantKnowledgeNamespace({
      enterpriseId: 'enterprise-a',
      organizationId: 'organization-a',
      workspaceId: 'workspace-1',
    });
    const secondNamespace = tenantKnowledgeNamespace({
      enterpriseId: 'enterprise-b',
      organizationId: 'organization-b',
      workspaceId: 'workspace-1',
    });

    expect(firstNamespace).toBe('enterprise:enterprise-a:org:organization-a:workspace:workspace-1');
    expect(secondNamespace).toBe(
      'enterprise:enterprise-b:org:organization-b:workspace:workspace-1',
    );
    expect(firstNamespace).not.toBe(secondNamespace);
  });
});
