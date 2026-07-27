import type { Metadata } from 'next';

import { BillingOverview, type BillingOverviewView } from '@/components/saas/billing-overview';
import { ClientPortalHeader } from '@/components/saas/client-portal-header';
import { hasSaasPermission } from '@/server/saas/rbac';
import { requireSaasContext } from '@/server/saas/auth';
import { getPublicBillingPlans } from '@/server/saas/billing/entitlements';
import { getOrganizationBillingSummary } from '@/server/saas/billing/summary';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  robots: { follow: false, index: false },
  title: '账单与使用量',
};

type BillingPageProps = Readonly<{
  readonly searchParams: Promise<Readonly<{ readonly organization?: string | readonly string[] }>>;
}>;

export default async function BillingPage({
  searchParams,
}: BillingPageProps): Promise<React.JSX.Element> {
  const query = await searchParams;
  const organizationSlug = typeof query.organization === 'string' ? query.organization : undefined;
  const context = await requireSaasContext(organizationSlug);
  const [billing, plans] = await Promise.all([
    getOrganizationBillingSummary(context),
    getPublicBillingPlans(),
  ]);
  const summary: BillingOverviewView = {
    subscription: {
      cancelAtPeriodEnd: billing.subscription.cancelAtPeriodEnd,
      currentPeriodEndsAt: billing.subscription.currentPeriodEndsAt?.toISOString(),
      status: billing.subscription.status,
      trialEndsAt: billing.subscription.trialEndsAt?.toISOString(),
    },
    usage: billing.usage,
    usagePeriod: billing.usagePeriod,
  };

  return (
    <div className="saas-portal-shell">
      <ClientPortalHeader
        currentPath="/dashboard/settings/billing"
        email={context.user.email}
        organization={context.organization}
        organizations={context.organizations}
      />
      <main className="saas-client-main">
        <div className="saas-client-page-content">
          <header className="saas-client-intro">
            <div>
              <p className="saas-kicker">
                {context.organization.slug.toLocaleUpperCase('en-US')} / BILLING
              </p>
              <h1>套餐、续费与使用量。</h1>
              <p>
                所有能力限制都在服务端执行。套餐更新会在完成 Stripe 验签后的 Webhook 到达时生效。
              </p>
            </div>
          </header>
          <BillingOverview
            canManage={hasSaasPermission(context.membership.role, 'billing.manage')}
            organizationSlug={context.organization.slug}
            plan={billing.plan}
            plans={plans}
            summary={summary}
          />
        </div>
      </main>
    </div>
  );
}
