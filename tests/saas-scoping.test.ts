import { describe, expect, it } from 'vitest';

import { isTenantResourceAccessible, tenantProjectWhere } from '../src/server/saas/scoping';

describe('SaaS 租户查询边界', () => {
  it('只为当前组织构造项目查询条件', () => {
    expect(
      tenantProjectWhere({
        enterpriseId: 'enterprise-a',
        organizationId: 'organization-a',
        projectId: 'project-1',
      }),
    ).toEqual({
      enterpriseId: 'enterprise-a',
      id: 'project-1',
      organizationId: 'organization-a',
    });
  });

  it('拒绝成员访问另一个组织的资源', () => {
    expect(
      isTenantResourceAccessible(
        { enterpriseId: 'enterprise-a', organizationId: 'organization-a' },
        { enterpriseId: 'enterprise-b', organizationId: 'organization-b' },
      ),
    ).toBe(false);
  });
});
