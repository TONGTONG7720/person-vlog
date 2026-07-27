import type { SaasPermission, SaasRole } from '@/server/saas/rbac';
import { hasSaasPermission } from '@/server/saas/rbac';

export {
  canUseFeature,
  checkPlanLimit,
  parsePlanEntitlements,
  planFeatures,
  planLimitFeatures,
  type PlanEntitlements,
  type PlanFeature,
  type PlanLimitDecision,
  type PlanLimitFeature,
} from '@/lib/permissions/plan-entitlements';

export function hasPermission(role: SaasRole, permission: SaasPermission): boolean {
  return hasSaasPermission(role, permission);
}
