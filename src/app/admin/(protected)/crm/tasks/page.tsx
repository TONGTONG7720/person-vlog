import { createCrmTask, deleteCrmTask, updateCrmTaskStatus } from '@/actions/admin/crm';
import { AdminDeleteForm } from '@/components/admin/admin-delete-form';
import { CrmTaskStatusBadge } from '@/components/crm/crm-status-badge';
import { CrmNavigation } from '@/components/crm/crm-navigation';
import {
  AdminEmptyState,
  AdminFormFeedback,
  AdminPageHeader,
  AdminSetupNotice,
  formatAdminDate,
} from '@/components/admin/admin-page-primitives';
import { isCmsDatabaseConfigured } from '@/server/cms/database';
import { crmTaskStatusFromPrisma } from '@/server/crm/mappings';
import { getCrmTasks } from '@/server/crm/queries';
import { crmTaskStatuses, crmTaskStatusLabels } from '@/types/crm';

type CrmTasksPageProps = Readonly<{
  readonly searchParams: Promise<Readonly<Record<string, string | string[] | undefined>>>;
}>;

export default async function CrmTasksPage({
  searchParams,
}: CrmTasksPageProps): Promise<React.JSX.Element> {
  const [tasks, databaseConfigured, query] = await Promise.all([
    getCrmTasks(),
    Promise.resolve(isCmsDatabaseConfigured()),
    searchParams,
  ]);

  return (
    <>
      <AdminPageHeader
        description="把需要回复、沟通或推进的事项集中安排，避免线索在收件箱和聊天记录里遗漏。"
        eyebrow="CRM / TASKS"
        title="跟进任务"
      />
      <CrmNavigation current="/admin/crm/tasks" />
      <AdminFormFeedback error={query['error']} success={query['success']} />
      {!databaseConfigured ? <AdminSetupNotice /> : null}
      <section className="crm-task-layout">
        <article className="admin-panel">
          <div className="admin-panel-header">
            <div>
              <p className="admin-kicker">CREATE</p>
              <h2>新任务</h2>
            </div>
          </div>
          <div className="admin-panel-body">
            <form action={createCrmTask} className="admin-resource-form crm-inline-resource-form">
              <label>
                任务标题
                <input name="title" required type="text" />
              </label>
              <label>
                关联线索 ID（可选）
                <input name="leadId" type="text" />
              </label>
              <label>
                截止日期
                <input name="dueDate" type="date" />
              </label>
              <button className="admin-primary-button" type="submit">
                创建任务
              </button>
            </form>
          </div>
        </article>

        <article className="admin-panel">
          <div className="admin-panel-header">
            <div>
              <p className="admin-kicker">QUEUE</p>
              <h2>任务队列</h2>
            </div>
          </div>
          <div className="admin-panel-body">
            {tasks.length === 0 ? (
              <AdminEmptyState>
                暂时没有任务。新官网咨询会按自动化规则创建 24 小时跟进提醒。
              </AdminEmptyState>
            ) : (
              <ul className="crm-task-list">
                {tasks.map((task) => {
                  const status = crmTaskStatusFromPrisma[task.status];

                  return (
                    <li key={task.id}>
                      <div>
                        <strong>{task.title}</strong>
                        <span>{task.lead?.name ?? '未关联线索'}</span>
                        <time dateTime={task.dueDate?.toISOString()}>
                          {task.dueDate === null ? '未设截止时间' : formatAdminDate(task.dueDate)}
                        </time>
                      </div>
                      <div className="crm-row-control-group">
                        <CrmTaskStatusBadge status={status} />
                        <form action={updateCrmTaskStatus} className="admin-inline-form">
                          <input name="id" type="hidden" value={task.id} />
                          <label className="visually-hidden" htmlFor={`task-status-${task.id}`}>
                            更新任务状态
                          </label>
                          <select defaultValue={status} id={`task-status-${task.id}`} name="status">
                            {crmTaskStatuses.map((option) => (
                              <option key={option} value={option}>
                                {crmTaskStatusLabels[option]}
                              </option>
                            ))}
                          </select>
                          <button className="admin-secondary-button" type="submit">
                            保存
                          </button>
                        </form>
                        <AdminDeleteForm
                          action={deleteCrmTask}
                          id={task.id}
                          resourceLabel={`任务「${task.title}」`}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </article>
      </section>
    </>
  );
}
