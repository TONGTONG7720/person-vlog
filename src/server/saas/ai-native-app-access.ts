import type { AiAppAccessRule } from '@/ai/blocks/contracts';
import type { SaasRole } from '@/server/saas/rbac';

type AiNativeAppMembership = Readonly<{
  readonly departmentId: string;
  readonly id: string;
  readonly role: SaasRole;
}>;

export function isAiNativeAppAccessibleToMembership(
  rules: readonly AiAppAccessRule[],
  membership: AiNativeAppMembership,
): boolean {
  return rules.some((rule) => {
    switch (rule.kind) {
      case 'ALL_MEMBERS':
        return true;
      case 'ROLE':
        return rule.subject === membership.role;
      case 'DEPARTMENT':
        return rule.subject === membership.departmentId;
      case 'MEMBERSHIP':
        return rule.subject === membership.id;
    }
  });
}
