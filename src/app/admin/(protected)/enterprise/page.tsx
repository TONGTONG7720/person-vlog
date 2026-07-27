import {
  AdminEmptyState,
  AdminPageHeader,
  AdminSetupNotice,
  formatAdminDate,
} from '@/components/admin/admin-page-primitives';
import { isCmsDatabaseConfigured } from '@/server/cms/database';
import { getEnterpriseAdminOverview } from '@/server/enterprise/admin';

export const dynamic = 'force-dynamic';

export default async function EnterpriseAdminPage(): Promise<React.JSX.Element> {
  const [databaseConfigured, overview] = await Promise.all([
    Promise.resolve(isCmsDatabaseConfigured()),
    getEnterpriseAdminOverview(),
  ]);

  return (
    <>
      <AdminPageHeader
        description="查看真实的企业、组织、部门、SSO 与 AI 内容安全状态。不会显示密钥、私有文档或模拟安全指标。"
        eyebrow="ENTERPRISE / SECURITY"
        title="企业能力运营"
      />
      {!databaseConfigured ? <AdminSetupNotice /> : null}
      <section aria-label="企业安全统计" className="saas-admin-metric-grid">
        <article className="admin-stat-card">
          <p>企业</p>
          <strong>{overview?.enterprises.length ?? '—'}</strong>
        </article>
        <article className="admin-stat-card">
          <p>启用 SSO</p>
          <strong>{overview?.activeSsoCount ?? '—'}</strong>
        </article>
        <article className="admin-stat-card">
          <p>待 AI 安全复核</p>
          <strong>{overview?.reviewDocumentCount ?? '—'}</strong>
        </article>
      </section>
      <section className="admin-panel">
        <div className="admin-panel-header">
          <div>
            <p className="admin-kicker">ENTERPRISES</p>
            <h2>企业、组织与安全连接</h2>
          </div>
        </div>
        <div className="admin-data-table-wrap">
          {overview === undefined || overview.enterprises.length === 0 ? (
            <div className="admin-panel-body">
              <AdminEmptyState>
                暂无企业记录。应用数据库迁移并完成客户注册后会显示在这里。
              </AdminEmptyState>
            </div>
          ) : (
            <table className="admin-data-table">
              <thead>
                <tr>
                  <th>企业</th>
                  <th>组织</th>
                  <th>部门</th>
                  <th>成员</th>
                  <th>SSO</th>
                  <th>创建时间</th>
                </tr>
              </thead>
              <tbody>
                {overview.enterprises.map((enterprise) => (
                  <tr key={enterprise.id}>
                    <td>
                      <span className="admin-data-title">
                        {enterprise.name}
                        <small>{enterprise.status}</small>
                      </span>
                    </td>
                    <td>
                      {enterprise._count.organizations}
                      <small>{enterprise.organizations.map((item) => item.slug).join(' / ')}</small>
                    </td>
                    <td>{enterprise._count.departments}</td>
                    <td>{enterprise._count.memberships}</td>
                    <td>{enterprise._count.ssoConnections}</td>
                    <td>{formatAdminDate(enterprise.createdAt)}</td>
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
