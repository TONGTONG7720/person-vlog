import type { PlanLimitFeature } from '@/lib/permissions';
import { requireCmsDatabase } from '@/server/cms/database';
import type { SaasContext } from '@/server/saas/auth';
import { getOrganizationBillingEntitlements } from '@/server/saas/billing/entitlements';
import {
  getBillingUsagePeriod,
  getCurrentMeteredUsage,
  getOrganizationStoredBytes,
} from '@/server/saas/billing/usage';

export type BillingUsageItem = Readonly<{
  readonly feature: PlanLimitFeature;
  readonly limit: number | null;
  readonly used: number;
}>;

export type OrganizationBillingSummary = Readonly<{
  readonly plan: Awaited<ReturnType<typeof getOrganizationBillingEntitlements>>['plan'];
  readonly subscription: Awaited<
    ReturnType<typeof getOrganizationBillingEntitlements>
  >['subscription'];
  readonly usage: readonly BillingUsageItem[];
  readonly usagePeriod: string;
}>;

export async function getOrganizationBillingSummary(
  context: SaasContext,
): Promise<OrganizationBillingSummary> {
  const database = requireCmsDatabase();
  const usagePeriod = getBillingUsagePeriod();
  const [
    billing,
    workspaceCount,
    aiWorkspaceCount,
    aiAssistantCount,
    aiDocumentCount,
    projectCount,
    memberCount,
    storedBytes,
    meteredUsage,
  ] = await Promise.all([
    getOrganizationBillingEntitlements(context),
    database.workspace.count({ where: { organizationId: context.organization.id } }),
    database.aiWorkspace.count({ where: { organizationId: context.organization.id } }),
    database.aiAssistant.count({ where: { organizationId: context.organization.id } }),
    database.aiKnowledgeDocument.count({ where: { organizationId: context.organization.id } }),
    database.workspaceProject.count({ where: { organizationId: context.organization.id } }),
    database.membership.count({ where: { organizationId: context.organization.id } }),
    getOrganizationStoredBytes(context.organization.id),
    getCurrentMeteredUsage(context.organization.id, usagePeriod),
  ]);

  const usage = [
    { feature: 'aiAssistants', used: aiAssistantCount },
    { feature: 'aiDocuments', used: aiDocumentCount },
    { feature: 'aiMessages', used: meteredUsage.aiMessages },
    { feature: 'aiTokens', used: meteredUsage.aiTokens },
    { feature: 'members', used: memberCount },
    { feature: 'projects', used: projectCount },
    { feature: 'storageBytes', used: storedBytes },
    { feature: 'workspaces', used: workspaceCount + aiWorkspaceCount },
  ] as const;

  return {
    plan: billing.plan,
    subscription: billing.subscription,
    usage: usage.map((item) => ({
      feature: item.feature,
      limit: billing.plan.entitlements.limits[item.feature],
      used: item.used,
    })),
    usagePeriod,
  };
}
