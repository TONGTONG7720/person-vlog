import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { EnterpriseSecurityCenter } from '@/components/enterprise/enterprise-security-center';
import { ClientPortalHeader } from '@/components/saas/client-portal-header';
import { getEnterpriseSecurityOverview } from '@/server/enterprise/security-service';
import { requireSaasContext } from '@/server/saas/auth';
import { hasSaasPermission } from '@/server/saas/rbac';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  robots: { follow: false, index: false },
  title: 'Enterprise Security | Tong',
};

type SecurityPageProps = Readonly<{
  readonly searchParams: Promise<Readonly<{ readonly organization?: string | readonly string[] }>>;
}>;

export default async function SecurityPage({
  searchParams,
}: SecurityPageProps): Promise<React.JSX.Element> {
  const query = await searchParams;
  const organizationSlug = typeof query.organization === 'string' ? query.organization : undefined;
  const context = await requireSaasContext(organizationSlug);

  if (!hasSaasPermission(context.membership.role, 'security.manage')) {
    redirect(`/client?organization=${encodeURIComponent(context.organization.slug)}`);
  }

  const overview = await getEnterpriseSecurityOverview(context);

  return (
    <div className="saas-portal-shell">
      <ClientPortalHeader
        currentPath="/dashboard/security"
        email={context.user.email}
        organization={context.organization}
        organizations={context.organizations}
      />
      <main className="saas-client-main">
        <div className="saas-client-page-content enterprise-security-page">
          <header className="saas-client-intro enterprise-security-intro">
            <div>
              <p className="saas-kicker">
                {context.enterprise.name.toLocaleUpperCase('en-US')} / SECURITY CENTER
              </p>
              <h1>让企业安全边界可配置、可审计、可追溯。</h1>
              <p>域名、SSO、API Gateway、AI 内容安全和审计都在同一个企业范围内由服务端强制校验。</p>
            </div>
            <div className="saas-client-organization">
              <span>当前组织</span>
              <strong>{context.organization.name}</strong>
            </div>
          </header>
          <EnterpriseSecurityCenter
            activeKeyCount={overview.activeKeyCount}
            canExportData={hasSaasPermission(context.membership.role, 'enterprise.manage')}
            audits={overview.auditLogs.map((audit) => ({
              action: audit.action,
              createdAt: audit.createdAt.toISOString(),
              id: audit.id,
              resource: audit.resource,
              userEmail: audit.user?.email ?? null,
            }))}
            documentStatuses={overview.documents.map((item) => ({
              count: item._count._all,
              status: item.status,
            }))}
            domains={overview.domains.map((domain) => ({
              domain: domain.domain,
              id: domain.id,
              verificationToken: domain.verificationToken,
              verifiedAt: domain.verifiedAt?.toISOString() ?? null,
            }))}
            organizationSlug={context.organization.slug}
            policy={{
              allowPersonalApiKeys: overview.policy.allowPersonalApiKeys,
              requireMfa: overview.policy.requireMfa,
              requireSso: overview.policy.requireSso,
              sensitiveDataScanning: overview.policy.sensitiveDataScanning,
            }}
            reviewDocuments={overview.reviewDocuments.map((document) => ({
              findings: toStringList(document.securityFindings),
              id: document.id,
              title: document.title,
            }))}
            ssoConnections={overview.ssoConnections.map((connection) => ({
              enabled: connection.enabled,
              id: connection.id,
              provider: connection.provider,
              updatedAt: connection.updatedAt.toISOString(),
            }))}
          />
        </div>
      </main>
    </div>
  );
}

function toStringList(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string')
    : [];
}
