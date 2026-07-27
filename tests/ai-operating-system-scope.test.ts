import { describe, expect, it } from 'vitest';

import {
  createAiOperatingSystemApiKeyExecutionScope,
  createAiOperatingSystemMemberExecutionScope,
} from '../src/server/saas/ai-operating-system-scope';

describe('AIOS 执行身份边界', () => {
  it('将成员上下文映射为可审计的企业执行身份', () => {
    expect(
      createAiOperatingSystemMemberExecutionScope({
        enterpriseId: 'enterprise_1',
        membershipId: 'membership_1',
        organizationId: 'organization_1',
        role: 'ADMIN',
        userId: 'user_1',
      }),
    ).toEqual({
      actor: { kind: 'member', membershipId: 'membership_1', role: 'ADMIN', userId: 'user_1' },
      tenant: { enterpriseId: 'enterprise_1', organizationId: 'organization_1' },
    });
  });

  it('将 API Key 映射为无成员写入权限的企业执行身份', () => {
    expect(
      createAiOperatingSystemApiKeyExecutionScope({
        apiKeyId: 'key_1',
        enterpriseId: 'enterprise_1',
        organizationId: 'organization_1',
      }),
    ).toEqual({
      actor: { apiKeyId: 'key_1', kind: 'api-key' },
      tenant: { enterpriseId: 'enterprise_1', organizationId: 'organization_1' },
    });
  });
});
