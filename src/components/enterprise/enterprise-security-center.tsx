import {
  AlertTriangle,
  FileSearch,
  KeyRound,
  Landmark,
  ScrollText,
  ShieldCheck,
} from 'lucide-react';

import { EnterpriseSecurityActions } from '@/components/enterprise/enterprise-security-actions';
import { formatSaasDate } from '@/lib/saas-presentation';

type EnterpriseSecurityCenterProps = Readonly<{
  readonly activeKeyCount: number;
  readonly canExportData: boolean;
  readonly audits: readonly Readonly<{
    readonly action: string;
    readonly createdAt: string;
    readonly id: string;
    readonly resource: string;
    readonly userEmail: string | null;
  }>[];
  readonly documentStatuses: readonly Readonly<{
    readonly count: number;
    readonly status: string;
  }>[];
  readonly domains: readonly Readonly<{
    readonly domain: string;
    readonly id: string;
    readonly verificationToken: string;
    readonly verifiedAt: string | null;
  }>[];
  readonly organizationSlug: string;
  readonly policy: Readonly<{
    readonly allowPersonalApiKeys: boolean;
    readonly requireMfa: boolean;
    readonly requireSso: boolean;
    readonly sensitiveDataScanning: boolean;
  }>;
  readonly reviewDocuments: readonly Readonly<{
    readonly findings: readonly string[];
    readonly id: string;
    readonly title: string;
  }>[];
  readonly ssoConnections: readonly Readonly<{
    readonly enabled: boolean;
    readonly id: string;
    readonly provider: string;
    readonly updatedAt: string;
  }>[];
}>;

export function EnterpriseSecurityCenter({
  activeKeyCount,
  canExportData,
  audits,
  documentStatuses,
  domains,
  organizationSlug,
  policy,
  reviewDocuments,
  ssoConnections,
}: EnterpriseSecurityCenterProps): React.JSX.Element {
  const verifiedDomains = domains.filter((domain) => domain.verifiedAt !== null).length;
  const reviewCount =
    documentStatuses.find((item) => item.status === 'SECURITY_REVIEW')?.count ?? 0;

  return (
    <div className="enterprise-security-center">
      <section aria-label="企业安全摘要" className="enterprise-security-metrics">
        <article>
          <ShieldCheck aria-hidden="true" size={18} />
          <span>已验证域名</span>
          <strong>{verifiedDomains}</strong>
          <small>{domains.length} 个企业域名</small>
        </article>
        <article>
          <Landmark aria-hidden="true" size={18} />
          <span>SSO 连接</span>
          <strong>{ssoConnections.filter((item) => item.enabled).length}</strong>
          <small>{ssoConnections.length === 0 ? '尚未配置' : '仅就绪连接可用于发现'}</small>
        </article>
        <article>
          <KeyRound aria-hidden="true" size={18} />
          <span>有效 API Key</span>
          <strong>{activeKeyCount}</strong>
          <small>受 scope、过期与撤销控制</small>
        </article>
        <article>
          <AlertTriangle aria-hidden="true" size={18} />
          <span>待安全复核</span>
          <strong>{reviewCount}</strong>
          <small>不会进入 AI 检索</small>
        </article>
      </section>
      <section
        aria-labelledby="enterprise-audit-heading"
        className="enterprise-security-audit-panel"
      >
        <div className="saas-panel-heading">
          <div>
            <p className="saas-kicker">AUDIT TRAIL</p>
            <h2 id="enterprise-audit-heading">企业审计记录</h2>
          </div>
          <span className="enterprise-security-export-actions">
            <a
              className="saas-secondary-button"
              href={`/api/v1/enterprise/security/audit/export?organization=${encodeURIComponent(organizationSlug)}`}
            >
              <ScrollText aria-hidden="true" size={16} />
              <span>导出 CSV</span>
            </a>
            {canExportData ? (
              <a
                className="saas-secondary-button"
                href={`/api/v1/enterprise/export?organization=${encodeURIComponent(organizationSlug)}`}
              >
                <ScrollText aria-hidden="true" size={16} />
                <span>导出企业数据</span>
              </a>
            ) : null}
          </span>
        </div>
        {audits.length === 0 ? (
          <p className="saas-empty-state">
            尚无审计记录。配置安全策略、域名、SSO 和 API Key 后会在这里留下可追溯事件。
          </p>
        ) : (
          <ul className="enterprise-audit-list">
            {audits.map((audit) => (
              <li key={audit.id}>
                <FileSearch aria-hidden="true" size={16} />
                <div>
                  <strong>{audit.action}</strong>
                  <span>
                    {audit.resource} · {audit.userEmail ?? '系统'}
                  </span>
                </div>
                <time dateTime={audit.createdAt}>{formatSaasDate(audit.createdAt)}</time>
              </li>
            ))}
          </ul>
        )}
      </section>
      <EnterpriseSecurityActions
        domains={domains}
        organizationSlug={organizationSlug}
        policy={policy}
        reviewDocuments={reviewDocuments}
      />
    </div>
  );
}
