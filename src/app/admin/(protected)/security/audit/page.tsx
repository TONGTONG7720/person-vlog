import Link from 'next/link';

import {
  AdminEmptyState,
  AdminPageHeader,
  AdminSearchForm,
  AdminSetupNotice,
  formatAdminDate,
} from '@/components/admin/admin-page-primitives';
import { isCmsDatabaseConfigured } from '@/server/cms/database';
import { getEnterpriseAuditAdminRows } from '@/server/enterprise/admin';

export const dynamic = 'force-dynamic';

type AuditAdminPageProps = Readonly<{
  readonly searchParams: Promise<Readonly<{ readonly search?: string | readonly string[] }>>;
}>;

export default async function EnterpriseAuditAdminPage({
  searchParams,
}: AuditAdminPageProps): Promise<React.JSX.Element> {
  const query = await searchParams;
  const search = typeof query.search === 'string' ? query.search : '';
  const [databaseConfigured, audits] = await Promise.all([
    Promise.resolve(isCmsDatabaseConfigured()),
    getEnterpriseAuditAdminRows(search),
  ]);

  return (
    <>
      <AdminPageHeader
        actions={
          <Link className="admin-secondary-button" href="/api/v1/admin/enterprise/audit/export">
            导出 CSV
          </Link>
        }
        description="按企业、组织、操作者、动作或资源检查真实的企业审计记录。导出不包含密钥、原始 IP 或文档正文。"
        eyebrow="SECURITY / AUDIT"
        title="企业审计日志"
      />
      {!databaseConfigured ? <AdminSetupNotice /> : null}
      <section className="admin-panel">
        <div className="admin-panel-header">
          <AdminSearchForm action="/admin/security/audit" search={search} />
        </div>
        <div className="admin-data-table-wrap">
          {audits === undefined || audits.length === 0 ? (
            <div className="admin-panel-body">
              <AdminEmptyState>
                没有匹配的审计记录。企业配置、权限、文件、AI 和 API Gateway 操作会记录在这里。
              </AdminEmptyState>
            </div>
          ) : (
            <table className="admin-data-table">
              <thead>
                <tr>
                  <th>时间</th>
                  <th>企业 / 组织</th>
                  <th>操作</th>
                  <th>资源</th>
                  <th>操作者</th>
                </tr>
              </thead>
              <tbody>
                {audits.map((audit) => (
                  <tr key={audit.id}>
                    <td>{formatAdminDate(audit.createdAt)}</td>
                    <td>
                      <span className="admin-data-title">
                        {audit.enterprise.name}
                        <small>
                          {audit.organization.name} / {audit.organization.slug}
                        </small>
                      </span>
                    </td>
                    <td>{audit.action}</td>
                    <td>{audit.resource}</td>
                    <td>{audit.user?.email ?? '系统'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </>
  );
}
