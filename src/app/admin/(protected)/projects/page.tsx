import {
  deleteAdminProject,
  createAdminProject,
  updateAdminProject,
} from '@/actions/admin/projects';
import { AdminDeleteForm } from '@/components/admin/admin-delete-form';
import {
  AdminEmptyState,
  AdminFormFeedback,
  AdminPageHeader,
  AdminPagination,
  AdminSearchForm,
  AdminSetupNotice,
  formatAdminDate,
} from '@/components/admin/admin-page-primitives';
import { AdminProjectForm } from '@/components/admin/forms/admin-project-form';
import { ProjectStatus } from '@/generated/prisma/client';
import { isCmsDatabaseConfigured } from '@/server/cms/database';
import { getAdminListQuery, getAdminProjects } from '@/server/cms/queries';

type ProjectsPageProps = Readonly<{
  readonly searchParams: Promise<Readonly<Record<string, string | string[] | undefined>>>;
}>;

export default async function AdminProjectsPage({
  searchParams,
}: ProjectsPageProps): Promise<React.JSX.Element> {
  const params = await searchParams;
  const query = getAdminListQuery(params['search'], params['page']);
  const [projects, databaseConfigured] = await Promise.all([
    getAdminProjects(query),
    Promise.resolve(isCmsDatabaseConfigured()),
  ]);

  return (
    <>
      <AdminPageHeader
        description="维护案例的描述、技术栈、状态和公开展示优先级。"
        eyebrow="CONTENT / PROJECTS"
        title="项目案例"
      />
      <AdminFormFeedback error={params['error']} success={params['success']} />
      {!databaseConfigured ? <AdminSetupNotice /> : null}
      <section className="admin-panel">
        <div className="admin-panel-header">
          <div>
            <p className="admin-kicker">CREATE</p>
            <h2>新增项目</h2>
          </div>
        </div>
        <div className="admin-panel-body">
          <AdminProjectForm action={createAdminProject} submitLabel="创建项目" />
        </div>
      </section>
      <section className="admin-panel">
        <div className="admin-panel-header">
          <div>
            <p className="admin-kicker">LIBRARY</p>
            <h2>项目列表</h2>
          </div>
          <AdminSearchForm action="/admin/projects" search={query.search} />
        </div>
        {projects.length === 0 ? (
          <div className="admin-panel-body">
            <AdminEmptyState>
              暂无项目。创建一个真实案例，开始构建对外展示的作品集。
            </AdminEmptyState>
          </div>
        ) : (
          <div className="admin-data-table-wrap">
            <table className="admin-data-table">
              <thead>
                <tr>
                  <th scope="col">项目</th>
                  <th scope="col">状态</th>
                  <th scope="col">语言</th>
                  <th scope="col">分类</th>
                  <th scope="col">更新时间</th>
                  <th scope="col">操作</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((project) => (
                  <tr key={project.id}>
                    <td>
                      <span className="admin-data-title">
                        {project.title}
                        <small>/{project.slug}</small>
                      </span>
                    </td>
                    <td>
                      <span className="admin-status-badge">
                        {getProjectStatusLabel(project.status)}
                      </span>
                    </td>
                    <td>{getLocaleLabel(project.locale)}</td>
                    <td>{project.categories.join(' · ')}</td>
                    <td>
                      <time dateTime={project.updatedAt.toISOString()}>
                        {formatAdminDate(project.updatedAt)}
                      </time>
                    </td>
                    <td>
                      <div className="admin-row-actions">
                        <details className="admin-details">
                          <summary>编辑</summary>
                          <AdminProjectForm
                            action={updateAdminProject}
                            submitLabel="保存项目"
                            values={{
                              categories: project.categories,
                              content: project.content,
                              coverImage: project.coverImage,
                              description: project.description,
                              featured: project.featured,
                              id: project.id,
                              locale: project.locale === 'en-US' ? 'en-US' : 'zh-CN',
                              slug: project.slug,
                              status: getProjectStatusValue(project.status),
                              technologies: project.technologies,
                              title: project.title,
                              translationGroup: project.translationGroup,
                            }}
                          />
                        </details>
                        <AdminDeleteForm
                          action={deleteAdminProject}
                          id={project.id}
                          resourceLabel={`项目「${project.title}」`}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <AdminPagination
          itemCount={projects.length}
          page={query.page}
          pathname="/admin/projects"
          search={query.search}
        />
      </section>
    </>
  );
}

function getProjectStatusLabel(status: ProjectStatus): string {
  if (status === ProjectStatus.COMPLETED) {
    return '已完成';
  }

  if (status === ProjectStatus.IN_PROGRESS) {
    return '开发中';
  }

  return '概念验证';
}

function getProjectStatusValue(status: ProjectStatus): 'completed' | 'concept' | 'in-progress' {
  if (status === ProjectStatus.COMPLETED) {
    return 'completed';
  }

  return status === ProjectStatus.IN_PROGRESS ? 'in-progress' : 'concept';
}

function getLocaleLabel(locale: string): string {
  return locale === 'en-US' ? 'EN' : '中文';
}
