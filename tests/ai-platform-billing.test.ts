import { describe, expect, it } from 'vitest';

import { checkPlanLimit, parsePlanEntitlements } from '../src/lib/permissions';

describe('AI SaaS 套餐额度', () => {
  it('在 AI Token 月额度耗尽时拒绝新的模型调用', () => {
    // Given
    const entitlements = parsePlanEntitlements({
      features: {
        aiWorkspace: true,
        apiAccess: true,
        privateKnowledge: true,
        prioritySupport: false,
      },
      limits: {
        aiAssistants: 3,
        aiDocuments: 20,
        aiMessages: 1_000,
        aiTokens: 100_000,
        members: 3,
        projects: 10,
        storageBytes: 10_737_418_240,
        workspaces: 3,
      },
    });

    // When
    const decision = checkPlanLimit({
      current: 99_900,
      entitlements,
      feature: 'aiTokens',
      requested: 200,
    });

    // Then
    expect(decision).toEqual({ kind: 'limit-reached', limit: 100_000, used: 99_900 });
  });
});
