import {
  AdminEmptyState,
  AdminPageHeader,
  AdminSetupNotice,
  formatAdminDate,
} from '@/components/admin/admin-page-primitives';
import { isCmsDatabaseConfigured } from '@/server/cms/database';
import { getSaasAdminOverview } from '@/server/saas/admin';

const subscriptionStatusLabels = {
  ACTIVE: '已启用',
  CANCELLED: '已取消',
  EXPIRED: '已过期',
  PAST_DUE: '待处理',
  TRIALING: '试用中',
} as const;

export const dynamic = 'force-dynamic';

export default async function SaasAdminPage(): Promise<React.JSX.Element> {
  const [databaseConfigured, overview] = await Promise.all([
    Promise.resolve(isCmsDatabaseConfigured()),
    getSaasAdminOverview(),
  ]);

  return (
    <>
      <AdminPageHeader
        description="查看组织、成员、套餐订阅和审计记录。这里仅呈现实际数据，不提供模拟的营收或使用量。"
        eyebrow="SAAS / OPERATIONS"
        title="SaaS 协作平台"
      />
      {!databaseConfigured ? <AdminSetupNotice /> : null}
      <section aria-label="SaaS 统计" className="saas-admin-metric-grid">
        <article className="admin-stat-card">
          <p>企业空间</p>
          <strong>{overview?.organizationCount ?? '—'}</strong>
        </article>
        <article className="admin-stat-card">
          <p>组织成员</p>
          <strong>{overview?.memberCount ?? '—'}</strong>
        </article>
        <article className="admin-stat-card">
          <p>注册账号</p>
          <strong>{overview?.userCount ?? '—'}</strong>
        </article>
        <article className="admin-stat-card">
          <p>套餐定义</p>
          <strong>{overview?.plans.length ?? '—'}</strong>
        </article>
      </section>
      <section className="admin-panel">
        <div className="admin-panel-header">
          <div>
            <p className="admin-kicker">ORGANIZATIONS</p>
            <h2>企业空间与订阅</h2>
          </div>
        </div>
        <div className="admin-data-table-wrap">
          {overview === undefined || overview.organizations.length === 0 ? (
            <div className="admin-panel-body">
              <AdminEmptyState>暂无企业空间。客户完成注册后会在此处显示。</AdminEmptyState>
            </div>
          ) : (
            <table className="admin-data-table">
              <thead>
                <tr>
                  <th>企业</th>
                  <th>成员</th>
                  <th>项目</th>
                  <th>套餐</th>
                  <th>创建时间</th>
                </tr>
              </thead>
              <tbody>
                {overview.organizations.map((organization) => (
                  <tr key={organization.id}>
                    <td>
                      <span className="admin-data-title">
                        {organization.name}
                        <small>{organization.slug}</small>
                      </span>
                    </td>
                    <td>{organization._count.memberships}</td>
                    <td>{organization._count.projects}</td>
                    <td>
                      {organization.subscription === null ? (
                        '未创建订阅'
                      ) : (
                        <span className="admin-status-badge">
                          {organization.subscription.plan.name} /{' '}
                          {subscriptionStatusLabels[organization.subscription.status]}
                        </span>
                      )}
                    </td>
                    <td>{formatAdminDate(organization.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
      <section className="saas-admin-grid">
        <article className="admin-panel">
          <div className="admin-panel-header">
            <div>
              <p className="admin-kicker">PLANS</p>
              <h2>订阅边界</h2>
            </div>
          </div>
          <div className="admin-panel-body">
            {overview === undefined || overview.plans.length === 0 ? (
              <AdminEmptyState>套餐默认值会在数据库种子初始化时创建。</AdminEmptyState>
            ) : (
              <ul className="saas-admin-list">
                {overview.plans.map((plan) => (
                  <li key={plan.id}>
                    <div>
                      <strong>{plan.name}</strong>
                      <span>{plan.key}</span>
                    </div>
                    <span>{plan._count.subscriptions} 个订阅</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </article>
        <article className="admin-panel">
          <div className="admin-panel-header">
            <div>
              <p className="admin-kicker">AUDIT LOG</p>
              <h2>最近审计记录</h2>
            </div>
          </div>
          <div className="admin-panel-body">
            {overview === undefined || overview.recentAudits.length === 0 ? (
              <AdminEmptyState>组织、项目、任务与文件发生变更后会显示审计记录。</AdminEmptyState>
            ) : (
              <ul className="saas-admin-list">
                {overview.recentAudits.map((audit) => (
                  <li key={audit.id}>
                    <div>
                      <strong>{audit.action}</strong>
                      <span>{audit.organization.name}</span>
                    </div>
                    <span>
                      {audit.user?.email ?? '系统'} / {formatAdminDate(audit.createdAt)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </article>
      </section>
    </>
  );
}
