import {
  AdminEmptyState,
  AdminPageHeader,
  AdminSetupNotice,
  formatAdminDate,
} from '@/components/admin/admin-page-primitives';
import { isCmsDatabaseConfigured } from '@/server/cms/database';
import { getAdminDashboardData } from '@/server/cms/queries';

const dashboardMetrics = [
  { key: 'projects', label: '项目案例' },
  { key: 'posts', label: '技术文章' },
  { key: 'messages', label: '咨询留言' },
  { key: 'knowledge', label: 'AI 知识' },
] as const;

export default async function AdminDashboardPage(): Promise<React.JSX.Element> {
  const databaseConfigured = isCmsDatabaseConfigured();
  const dashboard = await getAdminDashboardData();

  return (
    <>
      <AdminPageHeader
        description="查看内容资产、潜在合作咨询和最近的后台操作。"
        eyebrow="DASHBOARD / OVERVIEW"
        title="内容工作台"
      />
      {!databaseConfigured ? <AdminSetupNotice /> : null}
      <section aria-label="内容统计" className="admin-dashboard-grid">
        {dashboardMetrics.map((metric) => (
          <article className="admin-stat-card" key={metric.key}>
            <p>{metric.label}</p>
            <strong>{dashboard?.counts[metric.key] ?? '—'}</strong>
          </article>
        ))}
      </section>
      <section className="admin-panel">
        <div className="admin-panel-header">
          <div>
            <p className="admin-kicker">ACTIVITY</p>
            <h2>最近活动</h2>
          </div>
        </div>
        <div className="admin-panel-body">
          {dashboard === undefined || dashboard.activity.length === 0 ? (
            <AdminEmptyState>
              还没有内容操作记录。创建或更新内容后，活动会显示在这里。
            </AdminEmptyState>
          ) : (
            <ul className="admin-activity-list">
              {dashboard.activity.map((item) => (
                <li key={item.id}>
                  <span>{item.summary}</span>
                  <time dateTime={item.createdAt.toISOString()}>
                    {formatAdminDate(item.createdAt)}
                  </time>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </>
  );
}
