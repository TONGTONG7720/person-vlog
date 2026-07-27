import { describe, expect, it } from 'vitest';

import { isAiNativeAppAccessibleToMembership } from '../src/server/saas/ai-native-app-access';

describe('AI 原生应用访问规则', () => {
  const membership = {
    departmentId: 'department-support',
    id: 'membership-1',
    role: 'MEMBER' as const,
  };

  it('允许当前成员命中角色规则时使用已发布应用', () => {
    expect(
      isAiNativeAppAccessibleToMembership([{ kind: 'ROLE', subject: 'MEMBER' }], membership),
    ).toBe(true);
  });

  it('拒绝没有匹配部门、成员或角色规则的成员', () => {
    expect(
      isAiNativeAppAccessibleToMembership(
        [{ kind: 'DEPARTMENT', subject: 'department-sales' }],
        membership,
      ),
    ).toBe(false);
  });

  it('将全体成员规则作为显式组织内访问授权', () => {
    expect(isAiNativeAppAccessibleToMembership([{ kind: 'ALL_MEMBERS' }], membership)).toBe(true);
  });
});
