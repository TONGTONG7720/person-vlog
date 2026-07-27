import Link from 'next/link';

import { CrmLeadStatusBadge, CrmPriorityBadge } from '@/components/crm/crm-status-badge';
import { CrmNavigation } from '@/components/crm/crm-navigation';
import {
  AdminEmptyState,
  AdminPageHeader,
  AdminSetupNotice,
  formatAdminDate,
} from '@/components/admin/admin-page-primitives';
import { isCmsDatabaseConfigured } from '@/server/cms/database';
import { crmLeadPriorityFromPrisma, crmLeadStatusFromPrisma } from '@/server/crm/mappings';
import { getCrmDashboardData } from '@/server/crm/queries';

export default async function CrmDashboardPage(): Promise<React.JSX.Element> {
  const [dashboard, databaseConfigured] = await Promise.all([
    getCrmDashboardData(),
    Promise.resolve(isCmsDatabaseConfigured()),
  ]);
  const maximumFunnelValue = Math.max(
    1,
    ...(dashboard === undefined ? [] : dashboard.funnel.map((item) => item.value)),
  );

  return (
    <>
      <AdminPageHeader
        description="把官网咨询、社媒线索与后续合作统一到一条清晰的跟进链路中。"
        eyebrow="CRM / PIPELINE"
        title="客户线索工作台"
      />
      <CrmNavigation current="/admin/crm/dashboard" />
      {!databaseConfigured ? <AdminSetupNotice /> : null}
      {dashboard === undefined ? (
        <section className="admin-panel">
          <div className="admin-panel-body">
            <AdminEmptyState>连接数据库后，这里会显示真实的线索、转化和跟进数据。</AdminEmptyState>
          </div>
        </section>
      ) : (
        <>
          <section aria-label="CRM 核心指标" className="crm-metric-grid">
            <article className="admin-stat-card">
              <p>本月新增线索</p>
              <strong>{dashboard.metrics.monthlyLeads}</strong>
            </article>
            <article className="admin-stat-card">
              <p>推进中的客户</p>
              <strong>{dashboard.metrics.activeClients}</strong>
            </article>
            <article className="admin-stat-card">
              <p>已转客户项目</p>
              <strong>{dashboard.metrics.wonProjects}</strong>
            </article>
            <article className="admin-stat-card">
              <p>线索转化率</p>
              <strong>{dashboard.metrics.conversionRate}%</strong>
            </article>
            <article className="admin-stat-card crm-metric-wide">
              <p>热门合作方向</p>
              <strong>{dashboard.metrics.popularService}</strong>
            </article>
          </section>

          <section className="crm-dashboard-layout">
            <article className="admin-panel">
              <div className="admin-panel-header">
                <div>
                  <p className="admin-kicker">PIPELINE</p>
                  <h2>线索漏斗</h2>
                </div>
                <Link className="admin-secondary-button" href="/admin/crm/leads">
                  查看看板
                </Link>
              </div>
              <div className="admin-panel-body crm-funnel-list">
                {dashboard.funnel.map((item) => (
                  <div className="crm-funnel-item" key={item.status}>
                    <div>
                      <CrmLeadStatusBadge status={item.status} />
                      <span>{item.value}</span>
                    </div>
                    <progress max={maximumFunnelValue} value={item.value}>
                      {item.value}
                    </progress>
                  </div>
                ))}
              </div>
            </article>

            <article className="admin-panel">
              <div className="admin-panel-header">
                <div>
                  <p className="admin-kicker">SOURCE</p>
                  <h2>来源分析</h2>
                </div>
              </div>
              <div className="admin-panel-body">
                {dashboard.sources.length === 0 ? (
                  <AdminEmptyState>还没有带来源信息的线索。</AdminEmptyState>
                ) : (
                  <ul className="crm-ranked-list">
                    {dashboard.sources.map((item) => (
                      <li key={item.label}>
                        <span>{item.label}</span>
                        <strong>{item.value}</strong>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </article>
          </section>

          <section className="crm-dashboard-layout">
            <article className="admin-panel">
              <div className="admin-panel-header">
                <div>
                  <p className="admin-kicker">RECENT</p>
                  <h2>最新线索</h2>
                </div>
              </div>
              <div className="admin-panel-body">
                {dashboard.recentLeads.length === 0 ? (
                  <AdminEmptyState>官网和手动录入的线索会显示在这里。</AdminEmptyState>
                ) : (
                  <ul className="crm-compact-list">
                    {dashboard.recentLeads.map((lead) => (
                      <li key={lead.id}>
                        <div>
                          <Link href={`/admin/crm/leads/${lead.id}`}>{lead.name}</Link>
                          <time dateTime={lead.createdAt.toISOString()}>
                            {formatAdminDate(lead.createdAt)}
                          </time>
                        </div>
                        <div>
                          <CrmPriorityBadge priority={crmLeadPriorityFromPrisma[lead.priority]} />
                          <CrmLeadStatusBadge status={crmLeadStatusFromPrisma[lead.status]} />
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </article>

            <article className="admin-panel">
              <div className="admin-panel-header">
                <div>
                  <p className="admin-kicker">NEXT ACTION</p>
                  <h2>待跟进任务</h2>
                </div>
                <Link className="admin-secondary-button" href="/admin/crm/tasks">
                  管理任务
                </Link>
              </div>
              <div className="admin-panel-body">
                {dashboard.upcomingTasks.length === 0 ? (
                  <AdminEmptyState>暂时没有待处理的 CRM 任务。</AdminEmptyState>
                ) : (
                  <ul className="crm-compact-list">
                    {dashboard.upcomingTasks.map((task) => (
                      <li key={task.id}>
                        <div>
                          <strong>{task.title}</strong>
                          <span>{task.leadName ?? '未关联线索'}</span>
                        </div>
                        <time dateTime={task.dueDate?.toISOString()}>
                          {task.dueDate === null ? '未设截止时间' : formatAdminDate(task.dueDate)}
                        </time>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </article>
          </section>
        </>
      )}
    </>
  );
}
