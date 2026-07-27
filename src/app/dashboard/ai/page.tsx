import type { Metadata } from 'next';

import { AiPlatformDashboard } from '@/components/saas/ai-platform-dashboard';
import { ClientPortalHeader } from '@/components/saas/client-portal-header';
import { requireSaasContext } from '@/server/saas/auth';
import { getSaasAiDocuments } from '@/server/saas/ai-document-jobs';
import { getSaasAiPlatformOverview } from '@/server/saas/ai-workspaces';
import { hasSaasPermission } from '@/server/saas/rbac';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  robots: { follow: false, index: false },
  title: 'Tong AI Platform',
};

type AiDashboardPageProps = Readonly<{
  readonly searchParams: Promise<Readonly<{ readonly organization?: string | readonly string[] }>>;
}>;

export default async function AiDashboardPage({
  searchParams,
}: AiDashboardPageProps): Promise<React.JSX.Element> {
  const query = await searchParams;
  const organizationSlug = typeof query.organization === 'string' ? query.organization : undefined;
  const context = await requireSaasContext(organizationSlug);
  const [overview, documents] = await Promise.all([
    getSaasAiPlatformOverview(context),
    getSaasAiDocuments(context),
  ]);

  return (
    <div className="saas-portal-shell">
      <ClientPortalHeader
        currentPath="/dashboard/ai"
        email={context.user.email}
        organization={context.organization}
        organizations={context.organizations}
      />
      <main className="saas-client-main">
        <div className="saas-client-page-content">
          <header className="saas-client-intro saas-ai-intro">
            <div>
              <p className="saas-kicker">
                {context.organization.slug.toLocaleUpperCase('en-US')} / TONG AI PLATFORM
              </p>
              <h1>把企业资料，变成可引用的 AI 助手。</h1>
              <p>
                在这里创建 AI Workspace、配置助手、处理知识文档，并让现有业务系统通过受控 API 接入。
              </p>
            </div>
            <div className="saas-client-organization">
              <span>当前企业</span>
              <strong>{context.organization.name}</strong>
            </div>
          </header>
          <AiPlatformDashboard
            apiKeys={overview.apiKeys.map((apiKey) => ({
              createdAt: apiKey.createdAt.toISOString(),
              expiresAt: apiKey.expiresAt?.toISOString() ?? null,
              id: apiKey.id,
              lastUsedAt: apiKey.lastUsedAt?.toISOString() ?? null,
              name: apiKey.name,
              prefix: apiKey.prefix,
              revokedAt: apiKey.revokedAt?.toISOString() ?? null,
              scopes: apiKey.scopes,
            }))}
            canManage={hasSaasPermission(context.membership.role, 'ai.manage')}
            documents={documents.map((document) => ({
              chunkCount: document._count.chunks,
              id: document.id,
              permissionKeys: document.permissions.map((permission) => permission.roleKey),
              status: document.status,
              title: document.title,
              updatedAt: document.updatedAt.toISOString(),
              workspaceId: document.workspaceId,
            }))}
            organizationSlug={context.organization.slug}
            templates={overview.templates.map((template) => ({
              category: template.category,
              description: template.description,
              id: template.id,
              name: template.name,
            }))}
            usage={{
              costMicros: overview.usage._sum.costMicros ?? 0,
              requestCount: overview.usage._count._all,
              tokenCount:
                (overview.usage._sum.inputTokens ?? 0) + (overview.usage._sum.outputTokens ?? 0),
            }}
            workspaces={overview.workspaces.map((workspace) => ({
              assistantCount: workspace._count.assistants,
              assistants: workspace.assistants.map((assistant) => ({
                enabled: assistant.enabled,
                id: assistant.id,
                model: assistant.model,
                name: assistant.name,
                slug: assistant.slug,
                updatedAt: assistant.updatedAt.toISOString(),
              })),
              description: workspace.description,
              documentCount: workspace._count.documents,
              id: workspace.id,
              name: workspace.name,
              slug: workspace.slug,
            }))}
          />
        </div>
      </main>
    </div>
  );
}
