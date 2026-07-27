import type { Metadata } from 'next';

import { EcosystemDashboard } from '@/components/marketplace/ecosystem-dashboard';
import { ClientPortalHeader } from '@/components/saas/client-portal-header';
import { requireSaasContext } from '@/server/saas/auth';
import { hasSaasPermission } from '@/server/saas/rbac';
import { getMarketplaceCreatorDashboard } from '@/server/marketplace/creator';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  robots: { follow: false, index: false },
  title: 'Marketplace Creator | Tong',
};

type EcosystemPageProps = Readonly<{
  readonly searchParams: Promise<Readonly<{ readonly organization?: string | readonly string[] }>>;
}>;

export default async function EcosystemPage({
  searchParams,
}: EcosystemPageProps): Promise<React.JSX.Element> {
  const query = await searchParams;
  const organizationSlug = typeof query.organization === 'string' ? query.organization : undefined;
  const context = await requireSaasContext(organizationSlug);
  const overview = await getMarketplaceCreatorDashboard(context);
  const canPublish = hasSaasPermission(context.membership.role, 'marketplace.publish');

  return (
    <div className="saas-portal-shell">
      <ClientPortalHeader
        currentPath="/dashboard/ecosystem"
        email={context.user.email}
        organization={context.organization}
        organizations={context.organizations}
      />
      <main className="saas-client-main">
        <div className="saas-client-page-content">
          <header className="saas-client-intro marketplace-dashboard-intro">
            <div>
              <p className="saas-kicker">
                {context.organization.slug.toLocaleUpperCase('en-US')} / ECOSYSTEM
              </p>
              <h1>把团队的 AI 能力，变成可审核的产品。</h1>
              <p>
                创建草稿、提交人工审核、追踪真实调用与收藏，并为未来创作者收益建立清晰的数据边界。
              </p>
            </div>
            <div className="saas-client-organization">
              <span>当前企业</span>
              <strong>{context.organization.name}</strong>
            </div>
          </header>
          <EcosystemDashboard
            canPublish={canPublish}
            items={overview.items.map((item) => ({
              createdAt: item.createdAt.toISOString(),
              favoriteCount: item.favoriteCount,
              id: item.id,
              slug: item.slug,
              status: item.status,
              title: item.title,
              type: item.type,
              updatedAt: item.updatedAt.toISOString(),
              usageCount: item.usageCount,
            }))}
            metrics={overview.metrics}
            organizationSlug={context.organization.slug}
          />
        </div>
      </main>
    </div>
  );
}
