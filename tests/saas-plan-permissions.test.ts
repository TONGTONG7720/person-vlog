import { describe, expect, it } from 'vitest';

import {
  canUseFeature,
  checkPlanLimit,
  hasPermission,
  parsePlanEntitlements,
} from '../src/lib/permissions';
import { saasPermissions } from '../src/server/saas/rbac';

describe('SaaS 套餐权限中间层', () => {
  it('拒绝 Free 套餐使用私有知识库，但允许基础 AI 工作区', () => {
    // Given
    const entitlements = parsePlanEntitlements({
      features: {
        aiWorkspace: true,
        apiAccess: false,
        privateKnowledge: false,
        prioritySupport: false,
      },
      limits: { aiMessages: 100, members: 1, projects: 2, storageBytes: 1024, workspaces: 1 },
    });

    // When
    const canUseAiWorkspace = canUseFeature(entitlements, 'aiWorkspace');
    const canUsePrivateKnowledge = canUseFeature(entitlements, 'privateKnowledge');

    // Then
    expect(canUseAiWorkspace).toBe(true);
    expect(canUsePrivateKnowledge).toBe(false);
  });

  it('在额度已经耗尽时给出可供 API 转换的限制结果', () => {
    // Given
    const entitlements = parsePlanEntitlements({
      features: {
        aiWorkspace: true,
        apiAccess: false,
        privateKnowledge: false,
        prioritySupport: false,
      },
      limits: { aiMessages: 100, members: 1, projects: 2, storageBytes: 1024, workspaces: 1 },
    });

    // When
    const result = checkPlanLimit({
      current: 100,
      entitlements,
      feature: 'aiMessages',
      requested: 1,
    });

    // Then
    expect(result).toEqual({ kind: 'limit-reached', limit: 100, used: 100 });
  });

  it('沿用组织 RBAC，而不是让套餐替代成员权限', () => {
    // Given
    const role = 'MEMBER';

    // When
    const canManageBilling = hasPermission(role, saasPermissions.billingManage);

    // Then
    expect(canManageBilling).toBe(false);
  });
});
