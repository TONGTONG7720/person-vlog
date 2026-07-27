import { notFound } from 'next/navigation';

import {
  addCrmLeadActivity,
  createCrmProposal,
  createCrmTask,
  deleteCrmLead,
  updateCrmLeadStatus,
  updateCrmProposalStatus,
} from '@/actions/admin/crm';
import { AdminDeleteForm } from '@/components/admin/admin-delete-form';
import {
  CrmLeadStatusBadge,
  CrmPriorityBadge,
  CrmProjectStatusBadge,
  CrmProposalStatusBadge,
  CrmTaskStatusBadge,
} from '@/components/crm/crm-status-badge';
import { CrmNavigation } from '@/components/crm/crm-navigation';
import {
  AdminEmptyState,
  AdminFormFeedback,
  AdminPageHeader,
  AdminSetupNotice,
  formatAdminDate,
} from '@/components/admin/admin-page-primitives';
import { isCmsDatabaseConfigured } from '@/server/cms/database';
import {
  crmLeadActivityTypeFromPrisma,
  crmLeadPriorityFromPrisma,
  crmLeadStatusFromPrisma,
  crmProjectStatusFromPrisma,
  crmProposalStatusFromPrisma,
  crmTaskStatusFromPrisma,
} from '@/server/crm/mappings';
import { getCrmLeadDetail } from '@/server/crm/queries';
import {
  crmLeadActivityTypeLabels,
  crmLeadActivityTypes,
  crmLeadStatuses,
  crmLeadStatusLabels,
  crmProposalStatuses,
  crmProposalStatusLabels,
} from '@/types/crm';

type CrmLeadDetailPageProps = Readonly<{
  readonly params: Promise<Readonly<{ readonly id: string }>>;
  readonly searchParams: Promise<Readonly<Record<string, string | string[] | undefined>>>;
}>;

export default async function CrmLeadDetailPage({
  params,
  searchParams,
}: CrmLeadDetailPageProps): Promise<React.JSX.Element> {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const [lead, databaseConfigured] = await Promise.all([
    getCrmLeadDetail(id),
    Promise.resolve(isCmsDatabaseConfigured()),
  ]);

  if (lead === null && databaseConfigured) {
    notFound();
  }

  if (lead === undefined || lead === null) {
    return (
      <>
        <AdminPageHeader
          description="需要先配置数据库，才能查看和管理 CRM 客户线索。"
          eyebrow="CRM / LEAD"
          title="线索详情"
        />
        <CrmNavigation current="/admin/crm/leads" />
        <AdminSetupNotice />
      </>
    );
  }

  const leadStatus = crmLeadStatusFromPrisma[lead.status];

  return (
    <>
      <AdminPageHeader
        actions={
          <AdminDeleteForm
            action={deleteCrmLead}
            id={lead.id}
            resourceLabel={`线索「${lead.name}」`}
          />
        }
        description="保留每次联系、需求变化、方案和下一步任务，让合作推进过程可以持续追溯。"
        eyebrow="CRM / LEAD DETAIL"
        title={lead.name}
      />
      <CrmNavigation current="/admin/crm/leads" />
      <AdminFormFeedback error={query['error']} success={query['success']} />

      <section className="crm-detail-grid">
        <article className="admin-panel">
          <div className="admin-panel-header">
            <div>
              <p className="admin-kicker">CONTACT</p>
              <h2>联系与合作信息</h2>
            </div>
            <div className="crm-badge-group">
              <CrmPriorityBadge priority={crmLeadPriorityFromPrisma[lead.priority]} />
              <CrmLeadStatusBadge status={leadStatus} />
            </div>
          </div>
          <div className="admin-panel-body">
            <dl className="crm-detail-facts">
              <div>
                <dt>邮箱</dt>
                <dd>
                  <a href={`mailto:${lead.email}`}>{lead.email}</a>
                </dd>
              </div>
              <div>
                <dt>公司或团队</dt>
                <dd>{lead.company ?? '未填写'}</dd>
              </div>
              <div>
                <dt>合作方向</dt>
                <dd>{lead.service ?? '未填写'}</dd>
              </div>
              <div>
                <dt>预算</dt>
                <dd>{lead.budget ?? '未填写'}</dd>
              </div>
              <div>
                <dt>期望时间</dt>
                <dd>{lead.timeline ?? '未填写'}</dd>
              </div>
              <div>
                <dt>评分</dt>
                <dd>{lead.score} / 100</dd>
              </div>
              <div>
                <dt>来源</dt>
                <dd>{lead.source ?? '直接访问'}</dd>
              </div>
              <div>
                <dt>创建时间</dt>
                <dd>{formatAdminDate(lead.createdAt)}</dd>
              </div>
            </dl>
            {lead.tags.length === 0 ? null : (
              <div className="crm-tag-list" aria-label="线索标签">
                {lead.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
            )}
            {lead.notes === null ? null : <p className="crm-initial-notes">{lead.notes}</p>}
          </div>
        </article>

        <article className="admin-panel">
          <div className="admin-panel-header">
            <div>
              <p className="admin-kicker">PIPELINE</p>
              <h2>推进阶段</h2>
            </div>
          </div>
          <div className="admin-panel-body">
            <form
              action={updateCrmLeadStatus}
              className="admin-resource-form crm-inline-resource-form"
            >
              <input name="id" type="hidden" value={lead.id} />
              <label>
                当前阶段
                <select defaultValue={leadStatus} name="status">
                  {crmLeadStatuses.map((status) => (
                    <option key={status} value={status}>
                      {crmLeadStatusLabels[status]}
                    </option>
                  ))}
                </select>
              </label>
              <button className="admin-primary-button" type="submit">
                保存阶段
              </button>
            </form>
            <p className="crm-help-text">
              当状态更新为“已成交”时，系统会自动建立一个规划中的客户项目，避免手动重复录入。
            </p>
          </div>
        </article>
      </section>

      <section className="crm-detail-grid">
        <article className="admin-panel">
          <div className="admin-panel-header">
            <div>
              <p className="admin-kicker">ACTIVITY</p>
              <h2>跟进记录</h2>
            </div>
          </div>
          <div className="admin-panel-body">
            <form
              action={addCrmLeadActivity}
              className="admin-resource-form crm-inline-resource-form"
            >
              <input name="leadId" type="hidden" value={lead.id} />
              <label>
                记录类型
                <select defaultValue="note" name="type">
                  {crmLeadActivityTypes.map((type) => (
                    <option key={type} value={type}>
                      {crmLeadActivityTypeLabels[type]}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                内容
                <textarea name="content" required rows={4} />
              </label>
              <button className="admin-primary-button" type="submit">
                添加记录
              </button>
            </form>
            {lead.activities.length === 0 ? (
              <AdminEmptyState>还没有跟进记录。</AdminEmptyState>
            ) : (
              <ul className="crm-activity-list">
                {lead.activities.map((activity) => {
                  const type = crmLeadActivityTypeFromPrisma[activity.type];

                  return (
                    <li key={activity.id}>
                      <div>
                        <span>{crmLeadActivityTypeLabels[type]}</span>
                        <p>{activity.content}</p>
                      </div>
                      <time dateTime={activity.createdAt.toISOString()}>
                        {formatAdminDate(activity.createdAt)}
                      </time>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </article>

        <article className="admin-panel">
          <div className="admin-panel-header">
            <div>
              <p className="admin-kicker">INQUIRY</p>
              <h2>原始咨询</h2>
            </div>
          </div>
          <div className="admin-panel-body">
            {lead.message === null ? (
              <AdminEmptyState>这是手动录入的线索，未关联官网咨询内容。</AdminEmptyState>
            ) : (
              <p className="crm-message-content">{lead.message.message}</p>
            )}
          </div>
        </article>
      </section>

      <section className="crm-detail-grid">
        <article className="admin-panel">
          <div className="admin-panel-header">
            <div>
              <p className="admin-kicker">TASKS</p>
              <h2>下一步任务</h2>
            </div>
          </div>
          <div className="admin-panel-body">
            <form action={createCrmTask} className="admin-resource-form crm-inline-resource-form">
              <input name="leadId" type="hidden" value={lead.id} />
              <label>
                任务标题
                <input name="title" required type="text" />
              </label>
              <label>
                截止日期
                <input name="dueDate" type="date" />
              </label>
              <button className="admin-primary-button" type="submit">
                新建任务
              </button>
            </form>
            {lead.tasks.length === 0 ? (
              <AdminEmptyState>还没有关联任务。</AdminEmptyState>
            ) : (
              <ul className="crm-compact-list">
                {lead.tasks.map((task) => (
                  <li key={task.id}>
                    <div>
                      <strong>{task.title}</strong>
                      <time dateTime={task.dueDate?.toISOString()}>
                        {task.dueDate === null ? '未设截止时间' : formatAdminDate(task.dueDate)}
                      </time>
                    </div>
                    <CrmTaskStatusBadge status={crmTaskStatusFromPrisma[task.status]} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </article>

        <article className="admin-panel">
          <div className="admin-panel-header">
            <div>
              <p className="admin-kicker">PROPOSALS</p>
              <h2>方案与报价</h2>
            </div>
          </div>
          <div className="admin-panel-body">
            <form
              action={createCrmProposal}
              className="admin-resource-form crm-inline-resource-form"
            >
              <input name="leadId" type="hidden" value={lead.id} />
              <label>
                方案标题
                <input name="title" required type="text" />
              </label>
              <label>
                方案说明
                <textarea name="content" required rows={5} />
              </label>
              <button className="admin-primary-button" type="submit">
                创建方案
              </button>
            </form>
            {lead.proposals.length === 0 ? (
              <AdminEmptyState>还没有创建方案或报价。</AdminEmptyState>
            ) : (
              <ul className="crm-proposal-list">
                {lead.proposals.map((proposal) => {
                  const proposalStatus = crmProposalStatusFromPrisma[proposal.status];

                  return (
                    <li key={proposal.id}>
                      <div>
                        <strong>{proposal.title}</strong>
                        <p>{proposal.content}</p>
                      </div>
                      <form action={updateCrmProposalStatus} className="admin-inline-form">
                        <input name="id" type="hidden" value={proposal.id} />
                        <label
                          className="visually-hidden"
                          htmlFor={`proposal-status-${proposal.id}`}
                        >
                          更新方案状态
                        </label>
                        <select
                          defaultValue={proposalStatus}
                          id={`proposal-status-${proposal.id}`}
                          name="status"
                        >
                          {crmProposalStatuses.map((status) => (
                            <option key={status} value={status}>
                              {crmProposalStatusLabels[status]}
                            </option>
                          ))}
                        </select>
                        <CrmProposalStatusBadge status={proposalStatus} />
                        <button className="admin-secondary-button" type="submit">
                          保存
                        </button>
                      </form>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </article>
      </section>

      <section className="admin-panel">
        <div className="admin-panel-header">
          <div>
            <p className="admin-kicker">CLIENT PROJECTS</p>
            <h2>客户项目</h2>
          </div>
        </div>
        <div className="admin-panel-body">
          {lead.projects.length === 0 ? (
            <AdminEmptyState>线索成交后会自动出现在客户项目列表中。</AdminEmptyState>
          ) : (
            <ul className="crm-compact-list">
              {lead.projects.map((project) => (
                <li key={project.id}>
                  <div>
                    <strong>{project.title}</strong>
                    <span>{project.description ?? '暂无项目说明'}</span>
                  </div>
                  <CrmProjectStatusBadge status={crmProjectStatusFromPrisma[project.status]} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </>
  );
}
