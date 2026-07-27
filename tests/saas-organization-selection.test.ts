import { describe, expect, it } from 'vitest';

import { selectSaasOrganizationMembership } from '../src/server/saas/organization-selection';

const memberships = [
  { organization: { slug: 'acme' }, value: 'acme-member' },
  { organization: { slug: 'beta' }, value: 'beta-member' },
] as const;

describe('SaaS 组织成员选择', () => {
  it('在未指定组织时使用第一个可用成员关系', () => {
    expect(selectSaasOrganizationMembership(memberships, undefined)?.value).toBe('acme-member');
  });

  it('在指定不存在或无权组织时不回退到其他组织', () => {
    expect(selectSaasOrganizationMembership(memberships, 'other')).toBeUndefined();
  });
});
