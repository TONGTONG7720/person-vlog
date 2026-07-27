import type { BillingCycle, SubscriptionStatus } from '@/generated/prisma/client';
import {
  canUseFeature,
  checkPlanLimit,
  parsePlanEntitlements,
  type PlanEntitlements,
  type PlanFeature,
  type PlanLimitFeature,
} from '@/lib/permissions';
import { getCmsDatabase, requireCmsDatabase } from '@/server/cms/database';
import type { SaasContext } from '@/server/saas/auth';
import {
  BillingPlanUnavailableError,
  BillingStateMappingError,
  PlanFeatureUnavailableError,
  PlanLimitExceededError,
} from '@/server/saas/billing/billing-errors';
import { saasPlanDefinitions } from '@/server/saas/defaults';

export type BillingPlanView = Readonly<{
  readonly billingCycle: BillingCycle;
  readonly currency: string;
  readonly description: string;
  readonly entitlements: PlanEntitlements;
  readonly id: string | undefined;
  readonly name: string;
  readonly priceCents: number;
  readonly slug: string;
  readonly trialDays: number;
}>;

export type OrganizationBillingEntitlements = Readonly<{
  readonly plan: BillingPlanView;
  readonly subscription: Readonly<{
    readonly cancelAtPeriodEnd: boolean;
    readonly cancelledAt: Date | null;
    readonly currentPeriodEndsAt: Date | null;
    readonly currentPeriodStartsAt: Date | null;
    readonly id: string;
    readonly provider: string | null;
    readonly providerCustomerId: string | null;
    readonly providerSubscriptionId: string | null;
    readonly status: SubscriptionStatus;
    readonly trialEndsAt: Date | null;
  }>;
}>;

export async function getPublicBillingPlans(): Promise<readonly BillingPlanView[]> {
  const database = getCmsDatabase();

  if (database === undefined) {
    return getDefaultBillingPlans();
  }

  const plans = await database.plan.findMany({
    orderBy: { sortOrder: 'asc' },
    where: { active: true },
  });

  return plans.length === 0 ? getDefaultBillingPlans() : plans.map(toBillingPlanView);
}

export function getDefaultBillingPlans(): readonly BillingPlanView[] {
  return saasPlanDefinitions.map((plan) => ({
    billingCycle: plan.billingCycle,
    currency: plan.currency,
    description: plan.description,
    entitlements: parsePlanEntitlements({ features: plan.features, limits: plan.limits }),
    id: undefined,
    name: plan.name,
    priceCents: plan.priceCents,
    slug: plan.slug,
    trialDays: plan.trialDays,
  }));
}

export async function getOrganizationBillingEntitlements(
  context: SaasContext,
): Promise<OrganizationBillingEntitlements> {
  return getOrganizationBillingEntitlementsByOrganizationId(context.organization.id);
}

export async function getOrganizationBillingEntitlementsByOrganizationId(
  organizationId: string,
): Promise<OrganizationBillingEntitlements> {
  const subscription = await getSubscriptionWithPlan(organizationId);

  if (subscription === null || !subscription.plan.active) {
    throw new BillingPlanUnavailableError();
  }

  const plan = await resolveSubscriptionEntitlementPlan(subscription);

  return {
    plan: toBillingPlanView(plan),
    subscription: {
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
      cancelledAt: subscription.cancelledAt,
      currentPeriodEndsAt: subscription.currentPeriodEndsAt,
      currentPeriodStartsAt: subscription.currentPeriodStartsAt,
      id: subscription.id,
      provider: subscription.provider,
      providerCustomerId: subscription.providerCustomerId,
      providerSubscriptionId: subscription.providerSubscriptionId,
      status: subscription.status,
      trialEndsAt: subscription.trialEndsAt,
    },
  };
}

async function resolveSubscriptionEntitlementPlan(
  subscription: Exclude<Awaited<ReturnType<typeof getSubscriptionWithPlan>>, null>,
) {
  switch (subscription.status) {
    case 'ACTIVE':
    case 'PAST_DUE':
    case 'TRIALING':
      return subscription.plan;
    case 'CANCELLED':
    case 'EXPIRED': {
      const database = requireCmsDatabase();
      const freePlan = await database.plan.findUnique({ where: { key: 'free' } });

      if (freePlan === null || !freePlan.active) {
        throw new BillingPlanUnavailableError();
      }

      return freePlan;
    }
    default:
      return assertNever(subscription.status);
  }
}

async function getSubscriptionWithPlan(organizationId: string) {
  const database = requireCmsDatabase();

  return database.subscription.findUnique({
    include: { plan: true },
    where: { organizationId },
  });
}

export async function requirePlanFeature(
  context: SaasContext,
  feature: PlanFeature,
): Promise<void> {
  await requireOrganizationPlanFeature(context.organization.id, feature);
}

export async function requireOrganizationPlanFeature(
  organizationId: string,
  feature: PlanFeature,
): Promise<void> {
  const billing = await getOrganizationBillingEntitlementsByOrganizationId(organizationId);

  if (!canUseFeature(billing.plan.entitlements, feature)) {
    throw new PlanFeatureUnavailableError(feature);
  }
}

export async function requirePlanLimit(
  context: SaasContext,
  feature: PlanLimitFeature,
  current: number,
  requested = 1,
): Promise<void> {
  const billing = await getOrganizationBillingEntitlements(context);
  const decision = checkPlanLimit({
    current,
    entitlements: billing.plan.entitlements,
    feature,
    requested,
  });

  if (decision.kind === 'limit-reached') {
    throw new PlanLimitExceededError(feature, decision.limit);
  }
}

export async function getBillingPlanBySlug(slug: string): Promise<BillingPlanView> {
  const database = requireCmsDatabase();
  const plan = await database.plan.findFirst({ where: { active: true, slug } });

  if (plan === null) {
    throw new BillingPlanUnavailableError();
  }

  return toBillingPlanView(plan);
}

function toBillingPlanView(
  plan: Readonly<{
    readonly billingCycle: BillingCycle;
    readonly currency: string;
    readonly description: string;
    readonly features: unknown;
    readonly id: string;
    readonly limits: unknown;
    readonly name: string;
    readonly priceCents: number;
    readonly slug: string;
    readonly trialDays: number;
  }>,
): BillingPlanView {
  return {
    billingCycle: plan.billingCycle,
    currency: plan.currency,
    description: plan.description,
    entitlements: parsePlanEntitlements({ features: plan.features, limits: plan.limits }),
    id: plan.id,
    name: plan.name,
    priceCents: plan.priceCents,
    slug: plan.slug,
    trialDays: plan.trialDays,
  };
}

function assertNever(value: never): never {
  throw new BillingStateMappingError(String(value));
}
