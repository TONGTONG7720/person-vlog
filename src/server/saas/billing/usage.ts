import { checkPlanLimit, parsePlanEntitlements } from '@/lib/permissions';
import { requireCmsDatabase } from '@/server/cms/database';
import {
  BillingPlanUnavailableError,
  PlanLimitExceededError,
} from '@/server/saas/billing/billing-errors';

const usageTimeZone = 'Asia/Shanghai';

export const meteredPlanFeatures = [
  'aiMessages',
  'aiTokens',
  'marketplaceApiRequests',
  'storageBytes',
] as const;

export type MeteredPlanFeature = (typeof meteredPlanFeatures)[number];

type OrganizationUsageContext = Readonly<{
  readonly organization: Readonly<{ readonly id: string }>;
}>;

export function getBillingUsagePeriod(now = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    month: '2-digit',
    timeZone: usageTimeZone,
    year: 'numeric',
  }).formatToParts(now);
  const month = parts.find((part) => part.type === 'month')?.value;
  const year = parts.find((part) => part.type === 'year')?.value;

  return month === undefined || year === undefined ? '1970-01' : `${year}-${month}`;
}

export async function getCurrentMeteredUsage(
  organizationId: string,
  period = getBillingUsagePeriod(),
): Promise<Readonly<Record<MeteredPlanFeature, number>>> {
  const database = requireCmsDatabase();
  const usages = await database.usage.findMany({
    select: { count: true, feature: true },
    where: { organizationId, period },
  });
  const totals = { aiMessages: 0, aiTokens: 0, marketplaceApiRequests: 0, storageBytes: 0 };

  for (const usage of usages) {
    if (usage.feature === 'aiMessages') {
      totals.aiMessages = usage.count;
    }

    if (usage.feature === 'aiTokens') {
      totals.aiTokens = usage.count;
    }

    if (usage.feature === 'marketplaceApiRequests') {
      totals.marketplaceApiRequests = usage.count;
    }

    if (usage.feature === 'storageBytes') {
      totals.storageBytes = usage.count;
    }
  }

  return totals;
}

export async function getOrganizationStoredBytes(organizationId: string): Promise<number> {
  const database = requireCmsDatabase();
  const [projectFiles, aiDocuments] = await Promise.all([
    database.projectDocument.aggregate({
      _sum: { size: true },
      where: { organizationId },
    }),
    database.aiKnowledgeDocument.aggregate({
      _sum: { size: true },
      where: { organizationId },
    }),
  ]);

  return (projectFiles._sum.size ?? 0) + (aiDocuments._sum.size ?? 0);
}

export async function consumeMeteredPlanUsage(
  context: OrganizationUsageContext,
  feature: MeteredPlanFeature,
  amount: number,
): Promise<void> {
  const database = requireCmsDatabase();
  const period = getBillingUsagePeriod();
  const safeAmount = Math.max(0, Math.trunc(amount));

  await database.$transaction(async (transaction) => {
    const [subscription, usage] = await Promise.all([
      transaction.subscription.findUnique({
        include: { plan: { select: { features: true, limits: true } } },
        where: { organizationId: context.organization.id },
      }),
      transaction.usage.findUnique({
        select: { count: true },
        where: {
          organizationId_feature_period: {
            feature,
            organizationId: context.organization.id,
            period,
          },
        },
      }),
    ]);

    if (subscription === null || !subscription.plan) {
      throw new BillingPlanUnavailableError();
    }

    const decision = checkPlanLimit({
      current: usage?.count ?? 0,
      entitlements: parsePlanEntitlements({
        features: subscription.plan.features,
        limits: subscription.plan.limits,
      }),
      feature,
      requested: safeAmount,
    });

    if (decision.kind === 'limit-reached') {
      throw new PlanLimitExceededError(feature, decision.limit);
    }

    await transaction.usage.upsert({
      create: { count: safeAmount, feature, organizationId: context.organization.id, period },
      update: { count: { increment: safeAmount } },
      where: {
        organizationId_feature_period: {
          feature,
          organizationId: context.organization.id,
          period,
        },
      },
    });
  });
}
