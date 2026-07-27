import { createCrmProject, deleteCrmProject, updateCrmProjectStatus } from '@/actions/admin/crm';
import { AdminDeleteForm } from '@/components/admin/admin-delete-form';
import { CrmProjectStatusBadge } from '@/components/crm/crm-status-badge';
import { CrmNavigation } from '@/components/crm/crm-navigation';
import {
  AdminEmptyState,
  AdminFormFeedback,
  AdminPageHeader,
  AdminSetupNotice,
  formatAdminDate,
} from '@/components/admin/admin-page-primitives';
import { isCmsDatabaseConfigured } from '@/server/cms/database';
import { crmProjectStatusFromPrisma } from '@/server/crm/mappings';
import { getCrmProjects } from '@/server/crm/queries';
import { crmProjectStatuses, crmProjectStatusLabels } from '@/types/crm';

type CrmProjectsPageProps = Readonly<{
  readonly searchParams: Promise<Readonly<Record<string, string | string[] | undefined>>>;
}>;

export default async function CrmProjectsPage({
  searchParams,
}: CrmProjectsPageProps): Promise<React.JSX.Element> {
  const [projects, databaseConfigured, query] = await Promise.all([
    getCrmProjects(),
    Promise.resolve(isCmsDatabaseConfigured()),
    searchParams,
  ]);

  return (
    <>
      <AdminPageHeader
        description="成交线索会自动转入客户项目；随后按规划、设计、开发、测试和上线持续管理。"
        eyebrow="CRM / CLIENT PROJECTS"
        title="客户项目"
      />
      <CrmNavigation current="/admin/crm/projects" />
      <AdminFormFeedback error={query['error']} success={query['success']} />
      {!databaseConfigured ? <AdminSetupNotice /> : null}
      <section className="crm-task-layout">
        <article className="admin-panel">
          <div className="admin-panel-header">
            <div>
              <p className="admin-kicker">CREATE</p>
              <h2>新客户项目</h2>
            </div>
          </div>
          <div className="admin-panel-body">
            <form
              action={createCrmProject}
              className="admin-resource-form crm-inline-resource-form"
            >
              <label>
                项目名称
                <input name="title" required type="text" />
              </label>
              <label>
                关联线索 ID（可选）
                <input name="leadId" type="text" />
              </label>
              <label>
                预计交付日期
                <input name="dueDate" type="date" />
              </label>
              <label>
                项目说明
                <textarea name="description" rows={4} />
              </label>
              <button className="admin-primary-button" type="submit">
                创建客户项目
              </button>
            </form>
          </div>
        </article>

        <article className="admin-panel">
          <div className="admin-panel-header">
            <div>
              <p className="admin-kicker">DELIVERY</p>
              <h2>项目交付阶段</h2>
            </div>
          </div>
          <div className="admin-panel-body">
            {projects.length === 0 ? (
              <AdminEmptyState>
                暂无客户项目。将线索标记为已成交后会自动创建一个规划阶段项目。
              </AdminEmptyState>
            ) : (
              <ul className="crm-project-list">
                {projects.map((project) => {
                  const status = crmProjectStatusFromPrisma[project.status];

                  return (
                    <li key={project.id}>
                      <div>
                        <strong>{project.title}</strong>
                        <p>{project.description ?? '暂无项目说明'}</p>
                        <span>{project.lead?.name ?? '未关联线索'}</span>
                        <time dateTime={project.dueDate?.toISOString()}>
                          {project.dueDate === null
                            ? '未设预计交付日'
                            : formatAdminDate(project.dueDate)}
                        </time>
                      </div>
                      <div className="crm-row-control-group">
                        <CrmProjectStatusBadge status={status} />
                        <form action={updateCrmProjectStatus} className="admin-inline-form">
                          <input name="id" type="hidden" value={project.id} />
                          <label
                            className="visually-hidden"
                            htmlFor={`project-status-${project.id}`}
                          >
                            更新项目状态
                          </label>
                          <select
                            defaultValue={status}
                            id={`project-status-${project.id}`}
                            name="status"
                          >
                            {crmProjectStatuses.map((option) => (
                              <option key={option} value={option}>
                                {crmProjectStatusLabels[option]}
                              </option>
                            ))}
                          </select>
                          <button className="admin-secondary-button" type="submit">
                            保存
                          </button>
                        </form>
                        <AdminDeleteForm
                          action={deleteCrmProject}
                          id={project.id}
                          resourceLabel={`客户项目「${project.title}」`}
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
