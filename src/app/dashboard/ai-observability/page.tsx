import type { Metadata } from 'next';

import { AiObservabilityDashboard } from '@/components/saas/ai-observability-dashboard';
import { ClientPortalHeader } from '@/components/saas/client-portal-header';
import { requireSaasContext } from '@/server/saas/auth';
import { getAiOperatingSystemOverview } from '@/server/saas/ai-operating-system-overview';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  robots: { follow: false, index: false },
  title: 'Tong AIOS 运行观测',
};

type AiObservabilityPageProps = Readonly<{
  readonly searchParams: Promise<Readonly<{ readonly organization?: string | readonly string[] }>>;
}>;

export default async function AiObservabilityPage({
  searchParams,
}: AiObservabilityPageProps): Promise<React.JSX.Element> {
  const query = await searchParams;
  const organizationSlug = typeof query.organization === 'string' ? query.organization : undefined;
  const context = await requireSaasContext(organizationSlug);
  const overview = await getAiOperatingSystemOverview(context);

  return (
    <div className="saas-portal-shell">
      <ClientPortalHeader
        currentPath="/dashboard/ai-observability"
        email={context.user.email}
        organization={context.organization}
        organizations={context.organizations}
      />
      <main className="saas-client-main">
        <div className="saas-client-page-content">
          <header className="saas-client-intro">
            <div>
              <p className="saas-kicker">
                {context.organization.slug.toLocaleUpperCase('en-US')} / AIOS OBSERVABILITY
              </p>
              <h1>看清每一次 AI 协作的状态。</h1>
              <p>这里提供组织范围内的任务、审批、用量和脱敏 Trace，不展示原始提示词或企业密钥。</p>
            </div>
            <div className="saas-client-organization">
              <span>当前企业</span>
              <strong>{context.organization.name}</strong>
            </div>
          </header>
          {overview === undefined ? (
            <p className="saas-empty-state">CMS 数据库尚未连接，暂时无法加载组织级运行观测。</p>
          ) : (
            <AiObservabilityDashboard
              organizationSlug={context.organization.slug}
              overview={overview}
            />
          )}
        </div>
      </main>
    </div>
  );
}
