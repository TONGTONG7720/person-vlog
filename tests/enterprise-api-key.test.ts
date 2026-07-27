import { describe, expect, it } from 'vitest';

import { isAiApiKeyExpired, normalizeEnterpriseApiScopes } from '../src/server/saas/ai-api-keys';

describe('企业 API Key 安全边界', () => {
  it('仅保留已声明的最小权限 scope', () => {
    expect(normalizeEnterpriseApiScopes(['agent.execute', 'unknown.scope'])).toEqual([
      'agent.execute',
    ]);
  });

  it('拒绝已过期的 API Key', () => {
    expect(
      isAiApiKeyExpired(new Date('2026-07-26T00:00:00.000Z'), new Date('2026-07-27T00:00:00.000Z')),
    ).toBe(true);
    expect(isAiApiKeyExpired(undefined, new Date('2026-07-27T00:00:00.000Z'))).toBe(false);
  });
});
