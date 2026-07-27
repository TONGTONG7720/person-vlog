import { describe, expect, it } from 'vitest';

import { createOrganizationSlug, saasPlanDefinitions } from '../src/server/saas/defaults';

describe('SaaS 默认资源', () => {
  it('为新组织生成稳定且可路由的 slug', () => {
    expect(createOrganizationSlug('  Acme Studio  ')).toBe('acme-studio');
    expect(createOrganizationSlug('')).toBe('workspace');
  });

  it('预留 Free、Pro、Team 与 Enterprise 套餐', () => {
    expect(saasPlanDefinitions.map((plan) => plan.key)).toEqual([
      'free',
      'pro',
      'team',
      'enterprise',
    ]);
  });
});
