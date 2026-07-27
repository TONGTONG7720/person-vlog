import type { Metadata } from 'next';

import { AiInternalAppMarketplace } from '@/components/saas/ai-internal-app-marketplace';
import { ClientPortalHeader } from '@/components/saas/client-portal-header';
import { requireSaasContext } from '@/server/saas/auth';
import { getAiNativeAppMarketplace } from '@/server/saas/ai-native-apps';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  robots: { follow: false, index: false },
  title: 'Tong 企业 AI 应用市场',
};

type AppMarketplacePageProps = Readonly<{
  readonly searchParams: Promise<Readonly<{ readonly organization?: string | readonly string[] }>>;
}>;

export default async function AppMarketplacePage({
  searchParams,
}: AppMarketplacePageProps): Promise<React.JSX.Element> {
  const query = await searchParams;
  const organizationSlug = typeof query.organization === 'string' ? query.organization : undefined;
  const context = await requireSaasContext(organizationSlug);
  const apps = await getAiNativeAppMarketplace(context);

  return (
    <div className="saas-portal-shell">
      <ClientPortalHeader
        currentPath="/app-marketplace"
        email={context.user.email}
        organization={context.organization}
        organizations={context.organizations}
      />
      <main className="saas-client-main">
        <div className="saas-client-page-content">
          <AiInternalAppMarketplace
            apps={apps.map((app) => ({
              createdAt: app.createdAt.toISOString(),
              ...(app.description === null ? {} : { description: app.description }),
              id: app.id,
              name: app.name,
              ...(app.publishedAt === null ? {} : { publishedAt: app.publishedAt.toISOString() }),
              slug: app.slug,
              type: app.type,
              workspaceName: app.workspace.name,
            }))}
            organizationSlug={context.organization.slug}
          />
        </div>
      </main>
    </div>
  );
}
