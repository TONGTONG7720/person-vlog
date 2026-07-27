import type { Metadata } from 'next';

import { AiOperatingSystemDashboard } from '@/components/saas/ai-operating-system-dashboard';
import { ClientPortalHeader } from '@/components/saas/client-portal-header';
import { requireSaasContext } from '@/server/saas/auth';
import { getAiOperatingSystemOverview } from '@/server/saas/ai-operating-system-overview';
import { hasSaasPermission, saasPermissions } from '@/server/saas/rbac';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  robots: { follow: false, index: false },
  title: 'Tong 企业 AI 操作系统',
};

type AiWorkspacePageProps = Readonly<{
  readonly searchParams: Promise<Readonly<{ readonly organization?: string | readonly string[] }>>;
}>;

export default async function AiWorkspacePage({
  searchParams,
}: AiWorkspacePageProps): Promise<React.JSX.Element> {
  const query = await searchParams;
  const organizationSlug = typeof query.organization === 'string' ? query.organization : undefined;
  const context = await requireSaasContext(organizationSlug);
  const overview = await getAiOperatingSystemOverview(context);
  const canRun = hasSaasPermission(context.membership.role, saasPermissions.agentExecute);
  const canManage = hasSaasPermission(context.membership.role, saasPermissions.aiManage);

  return (
    <div className="saas-portal-shell">
      <ClientPortalHeader
        currentPath="/dashboard/ai-workspace"
        email={context.user.email}
        organization={context.organization}
        organizations={context.organizations}
      />
      <main className="saas-client-main">
        <div className="saas-client-page-content">
          <header className="saas-client-intro">
            <div>
              <p className="saas-kicker">
                {context.organization.slug.toLocaleUpperCase('en-US')} / ENTERPRISE AIOS
              </p>
              <h1>把企业工作，变成可控的 AI 协作。</h1>
              <p>
                在授权 Workspace 中发起任务、查看可复核报告，并让需要业务动作的请求先进入人工审批。
              </p>
            </div>
            <div className="saas-client-organization">
              <span>当前企业</span>
              <strong>{context.organization.name}</strong>
            </div>
          </header>
          {overview === undefined ? (
            <p className="saas-empty-state">
              CMS 数据库尚未连接。配置 DATABASE_URL 后执行迁移，即可启用企业 AI 操作系统。
            </p>
          ) : (
            <AiOperatingSystemDashboard
              canManage={canManage}
              canRun={canRun}
              organizationSlug={context.organization.slug}
              overview={overview}
            />
          )}
        </div>
      </main>
    </div>
  );
}
