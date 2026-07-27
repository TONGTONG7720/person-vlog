import type { Metadata } from 'next';

import { AiAppsDashboard } from '@/components/saas/ai-apps-dashboard';
import { ClientPortalHeader } from '@/components/saas/client-portal-header';
import { requireSaasContext } from '@/server/saas/auth';
import { getAiNativeAppOverview } from '@/server/saas/ai-native-apps';
import { hasSaasPermission, saasPermissions } from '@/server/saas/rbac';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  robots: { follow: false, index: false },
  title: 'Tong AI App Builder',
};

type AiAppsPageProps = Readonly<{
  readonly searchParams: Promise<Readonly<{ readonly organization?: string | readonly string[] }>>;
}>;

export default async function AiAppsPage({
  searchParams,
}: AiAppsPageProps): Promise<React.JSX.Element> {
  const query = await searchParams;
  const organizationSlug = typeof query.organization === 'string' ? query.organization : undefined;
  const context = await requireSaasContext(organizationSlug);
  const overview = await getAiNativeAppOverview(context);
  const canManage = hasSaasPermission(context.membership.role, saasPermissions.aiManage);

  return (
    <div className="saas-portal-shell">
      <ClientPortalHeader
        currentPath="/dashboard/apps"
        email={context.user.email}
        organization={context.organization}
        organizations={context.organizations}
      />
      <main className="saas-client-main">
        <div className="saas-client-page-content">
          <header className="saas-client-intro ai-apps-intro">
            <div>
              <p className="saas-kicker">
                {context.organization.slug.toLocaleUpperCase('en-US')} / AI NATIVE APPLICATIONS
              </p>
              <h1>把企业知识和流程，做成可控的 AI 应用。</h1>
              <p>从模板、Block 和可视化流程开始，在 Sandbox 测试后再发布给授权成员使用。</p>
            </div>
            <div className="saas-client-organization">
              <span>当前企业</span>
              <strong>{context.organization.name}</strong>
            </div>
          </header>
          {overview === undefined ? (
            <p className="saas-empty-state">
              CMS 数据库尚未连接。配置 DATABASE_URL 并执行阶段三十一迁移后，即可启用 AI App
              Builder。
            </p>
          ) : (
            <AiAppsDashboard
              analytics={overview.analytics}
              apps={overview.apps.map((app) => ({
                blockCount: Array.isArray(app.blocks) ? app.blocks.length : 0,
                id: app.id,
                metric: overview.analytics.appMetrics.find((metric) => metric.appId === app.id) ?? {
                  activeUserCount: 0,
                  failureRate: 0,
                  requestCount: 0,
                },
                name: app.name,
                published: app.published,
                slug: app.slug,
                status: app.status,
                type: app.type,
                updatedAt: app.updatedAt.toISOString(),
                workspaceName: app.workspace.name,
              }))}
              canManage={canManage}
              organizationSlug={context.organization.slug}
              templates={overview.templates.map((template) => ({
                category: template.category,
                description: template.description,
                key: template.key,
                name: template.name,
                type: template.type,
              }))}
            />
          )}
        </div>
      </main>
    </div>
  );
}
