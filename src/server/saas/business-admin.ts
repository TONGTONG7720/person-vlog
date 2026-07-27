import { BillingCycle, SubscriptionStatus, type PaymentStatus } from '@/generated/prisma/client';
import { getCmsDatabase } from '@/server/cms/database';
import { getBillingUsagePeriod } from '@/server/saas/billing/usage';

const recentWindowDays = 30;

export type BusinessAdminOverview = Readonly<{
  readonly metrics: Readonly<{
    readonly activeCustomerCount: number;
    readonly annualRecurringRevenueCents: number;
    readonly churnRatePercent: number;
    readonly conversionRatePercent: number;
    readonly monthlyRecurringRevenueCents: number;
    readonly newOrganizationCount: number;
    readonly newSubscriptionCount: number;
    readonly trialOrganizationCount: number;
  }>;
  readonly plans: readonly Readonly<{
    readonly active: boolean;
    readonly billingCycle: BillingCycle;
    readonly name: string;
    readonly priceCents: number;
    readonly slug: string;
    readonly subscriptionCount: number;
  }>[];
  readonly recentPayments: readonly Readonly<{
    readonly amountCents: number;
    readonly createdAt: Date;
    readonly currency: string;
    readonly id: string;
    readonly organizationName: string;
    readonly planName: string;
    readonly status: PaymentStatus;
  }>[];
  readonly recentSubscriptions: readonly Readonly<{
    readonly cancelAtPeriodEnd: boolean;
    readonly createdAt: Date;
    readonly currentPeriodEndsAt: Date | null;
    readonly id: string;
    readonly organizationName: string;
    readonly planName: string;
    readonly status: SubscriptionStatus;
  }>[];
  readonly usage: readonly Readonly<{
    readonly count: number;
    readonly feature: string;
  }>[];
  readonly usagePeriod: string;
}>;

type ActiveSubscription = Readonly<{
  readonly plan: Readonly<{
    readonly billingCycle: BillingCycle;
    readonly priceCents: number;
  }>;
}>;

export async function getBusinessAdminOverview(): Promise<BusinessAdminOverview | undefined> {
  const database = getCmsDatabase();

  if (database === undefined) {
    return undefined;
  }

  const usagePeriod = getBillingUsagePeriod();
  const recentSince = new Date(Date.now() - recentWindowDays * 24 * 60 * 60 * 1_000);
  const [
    organizationCount,
    activeCustomerCount,
    trialOrganizationCount,
    newOrganizationCount,
    activeSubscriptions,
    newSubscriptionCount,
    churnedSubscriptionCount,
    usages,
    plans,
    subscriptions,
    payments,
  ] = await Promise.all([
    database.organization.count(),
    database.organization.count({ where: { lifecycleStage: 'CUSTOMER' } }),
    database.organization.count({ where: { lifecycleStage: 'TRIAL' } }),
    database.organization.count({ where: { createdAt: { gte: recentSince } } }),
    database.subscription.findMany({
      select: { plan: { select: { billingCycle: true, priceCents: true } } },
      where: { status: SubscriptionStatus.ACTIVE },
    }),
    database.subscription.count({ where: { createdAt: { gte: recentSince } } }),
    database.billingEvent.count({
      where: { createdAt: { gte: recentSince }, type: 'customer.subscription.deleted' },
    }),
    database.usage.findMany({
      orderBy: { count: 'desc' },
      select: { count: true, feature: true },
      where: { period: usagePeriod },
    }),
    database.plan.findMany({
      include: { _count: { select: { subscriptions: true } } },
      orderBy: { sortOrder: 'asc' },
    }),
    database.subscription.findMany({
      include: {
        organization: { select: { name: true } },
        plan: { select: { name: true } },
      },
      orderBy: { updatedAt: 'desc' },
      take: 20,
    }),
    database.payment.findMany({
      include: {
        organization: { select: { name: true } },
        subscription: { include: { plan: { select: { name: true } } } },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    }),
  ]);
  const monthlyRecurringRevenueCents = calculateMonthlyRecurringRevenueCents(activeSubscriptions);
  const churnRatePercent = calculatePercentage(
    churnedSubscriptionCount,
    activeSubscriptions.length + churnedSubscriptionCount,
  );
  const conversionRatePercent = calculatePercentage(activeCustomerCount, organizationCount);

  return {
    metrics: {
      activeCustomerCount,
      annualRecurringRevenueCents: monthlyRecurringRevenueCents * 12,
      churnRatePercent,
      conversionRatePercent,
      monthlyRecurringRevenueCents,
      newOrganizationCount,
      newSubscriptionCount,
      trialOrganizationCount,
    },
    plans: plans.map((plan) => ({
      active: plan.active,
      billingCycle: plan.billingCycle,
      name: plan.name,
      priceCents: plan.priceCents,
      slug: plan.slug,
      subscriptionCount: plan._count.subscriptions,
    })),
    recentPayments: payments.map((payment) => ({
      amountCents: payment.amountCents,
      createdAt: payment.createdAt,
      currency: payment.currency,
      id: payment.id,
      organizationName: payment.organization.name,
      planName: payment.subscription.plan.name,
      status: payment.status,
    })),
    recentSubscriptions: subscriptions.map((subscription) => ({
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
      createdAt: subscription.createdAt,
      currentPeriodEndsAt: subscription.currentPeriodEndsAt,
      id: subscription.id,
      organizationName: subscription.organization.name,
      planName: subscription.plan.name,
      status: subscription.status,
    })),
    usage: usages.map((usage) => ({ count: usage.count, feature: usage.feature })),
    usagePeriod,
  };
}

function calculateMonthlyRecurringRevenueCents(
  subscriptions: readonly ActiveSubscription[],
): number {
  return subscriptions.reduce((total, subscription) => {
    switch (subscription.plan.billingCycle) {
      case BillingCycle.MONTHLY:
        return total + subscription.plan.priceCents;
      case BillingCycle.YEARLY:
        return total + Math.round(subscription.plan.priceCents / 12);
      default:
        return assertNever(subscription.plan.billingCycle);
    }
  }, 0);
}

function calculatePercentage(numerator: number, denominator: number): number {
  if (denominator === 0) {
    return 0;
  }

  return Math.round((numerator / denominator) * 10_000) / 100;
}

function assertNever(value: never): never {
  throw new BusinessMetricStateError(String(value));
}

class BusinessMetricStateError extends Error {
  public constructor(public readonly value: string) {
    super(`Cannot calculate a business metric for state: ${value}`);
    this.name = 'BusinessMetricStateError';
  }
}
