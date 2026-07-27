import {
  createAdminContentPlan,
  createAdminKeyword,
  deleteAdminContentPlan,
  deleteAdminKeyword,
  updateAdminContentPlan,
} from '@/actions/admin/content-growth';
import { AdminContentPlanForm } from '@/components/admin/forms/admin-content-plan-form';
import { AdminKeywordForm } from '@/components/admin/forms/admin-keyword-form';
import { ContentAiAssistant } from '@/components/admin/content-growth/content-ai-assistant';
import { ContentCalendar } from '@/components/admin/content-growth/content-calendar';
import { AdminDeleteForm } from '@/components/admin/admin-delete-form';
import {
  AdminEmptyState,
  AdminFormFeedback,
  AdminPageHeader,
  AdminSetupNotice,
} from '@/components/admin/admin-page-primitives';
import {
  contentCategoryLabels,
  contentPlanPriorityLabels,
  contentPlanStatusLabels,
  normalizeContentCategory,
  normalizeContentPlanPriority,
  normalizeContentPlanStatus,
  topicClusters,
} from '@/config/content';
import { isCmsDatabaseConfigured } from '@/server/cms/database';
import { getAdminContentGrowthWorkspace } from '@/server/cms/content-growth-queries';

type ContentPlanPageProps = Readonly<{
  readonly searchParams: Promise<Readonly<Record<string, string | string[] | undefined>>>;
}>;

export default async function AdminContentPlanPage({
  searchParams,
}: ContentPlanPageProps): Promise<React.JSX.Element> {
  const [params, workspace] = await Promise.all([searchParams, getAdminContentGrowthWorkspace()]);
  const plans = workspace?.plans ?? [];
  const keywords = workspace?.keywords ?? [];

  return (
    <>
      <AdminPageHeader
        description="把技术选题、关键词、排期与社交改写草稿组织为可持续更新的内容工作流。"
        eyebrow="CONTENT / GROWTH"
        title="内容增长工作台"
      />
      <AdminFormFeedback error={params['error']} success={params['success']} />
      {!isCmsDatabaseConfigured() ? <AdminSetupNotice /> : null}
      <section className="admin-panel">
        <div className="admin-panel-header">
          <div>
            <p className="admin-kicker">PLAN</p>
            <h2>新建内容选题</h2>
          </div>
        </div>
        <div className="admin-panel-body">
          <AdminContentPlanForm action={createAdminContentPlan} submitLabel="保存选题" />
        </div>
      </section>
      <section className="admin-panel">
        <div className="admin-panel-header">
          <div>
            <p className="admin-kicker">CALENDAR</p>
            <h2>内容日历</h2>
          </div>
        </div>
        <div className="admin-panel-body">
          <ContentCalendar plans={plans} />
        </div>
      </section>
      <section className="admin-panel">
        <div className="admin-panel-header">
          <div>
            <p className="admin-kicker">BACKLOG</p>
            <h2>选题状态</h2>
          </div>
        </div>
        {plans.length === 0 ? (
          <div className="admin-panel-body">
            <AdminEmptyState>
              内容库还是空的。可先把近期要写的项目复盘、教程或技术判断加入这里。
            </AdminEmptyState>
          </div>
        ) : (
          <div className="admin-data-table-wrap">
            <table className="admin-data-table">
              <thead>
                <tr>
                  <th scope="col">选题</th>
                  <th scope="col">分类</th>
                  <th scope="col">状态</th>
                  <th scope="col">优先级</th>
                  <th scope="col">语言</th>
                  <th scope="col">操作</th>
                </tr>
              </thead>
              <tbody>
                {plans.map((plan) => {
                  const category = normalizeContentCategory(plan.category);
                  const status = normalizeContentPlanStatus(plan.status);
                  const priority = normalizeContentPlanPriority(plan.priority);

                  return (
                    <tr key={plan.id}>
                      <td>
                        <span className="admin-data-title">
                          {plan.title}
                          <small>{plan.keyword}</small>
                        </span>
                      </td>
                      <td>{contentCategoryLabels[category]}</td>
                      <td>
                        <span className="admin-status-badge">
                          {contentPlanStatusLabels[status]}
                        </span>
                      </td>
                      <td>{contentPlanPriorityLabels[priority]}</td>
                      <td>{plan.locale === 'en-US' ? 'EN' : '中文'}</td>
                      <td>
                        <div className="admin-row-actions">
                          <details className="admin-details">
                            <summary>编辑</summary>
                            <AdminContentPlanForm
                              action={updateAdminContentPlan}
                              submitLabel="保存选题"
                              values={{
                                category,
                                id: plan.id,
                                keyword: plan.keyword,
                                locale: plan.locale === 'en-US' ? 'en-US' : 'zh-CN',
                                notes: plan.notes,
                                priority,
                                publishDate: plan.publishDate,
                                status,
                                title: plan.title,
                              }}
                            />
                          </details>
                          <AdminDeleteForm
                            action={deleteAdminContentPlan}
                            id={plan.id}
                            resourceLabel={`选题「${plan.title}」`}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
      <section className="admin-panel">
        <div className="admin-panel-header">
          <div>
            <p className="admin-kicker">KEYWORDS</p>
            <h2>关键词库</h2>
          </div>
        </div>
        <div className="admin-panel-body content-growth-keyword-create">
          <AdminKeywordForm action={createAdminKeyword} submitLabel="加入关键词库" />
        </div>
        {keywords.length === 0 ? null : (
          <div className="admin-data-table-wrap">
            <table className="admin-data-table">
              <thead>
                <tr>
                  <th scope="col">关键词</th>
                  <th scope="col">分类</th>
                  <th scope="col">搜索难度</th>
                  <th scope="col">搜索量</th>
                  <th scope="col">操作</th>
                </tr>
              </thead>
              <tbody>
                {keywords.map((keyword) => (
                  <tr key={keyword.id}>
                    <td>{keyword.keyword}</td>
                    <td>{contentCategoryLabels[normalizeContentCategory(keyword.category)]}</td>
                    <td>{keyword.difficulty ?? '待补充'}</td>
                    <td>{keyword.volume ?? '待补充'}</td>
                    <td>
                      <AdminDeleteForm
                        action={deleteAdminKeyword}
                        id={keyword.id}
                        resourceLabel={`关键词「${keyword.keyword}」`}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      <ContentAiAssistant />
      <section className="admin-panel">
        <div className="admin-panel-header">
          <div>
            <p className="admin-kicker">TOPIC CLUSTERS</p>
            <h2>专题内容方向</h2>
          </div>
        </div>
        <div className="admin-panel-body topic-cluster-list">
          {topicClusters.map((cluster) => (
            <article key={cluster.id}>
              <p>{contentCategoryLabels[cluster.category]}</p>
              <h3>{cluster.title}</h3>
              <strong>{cluster.pillarTitle}</strong>
              <span>{cluster.supportingTopics.join(' · ')}</span>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
