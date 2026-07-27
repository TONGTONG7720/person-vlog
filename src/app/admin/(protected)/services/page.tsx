import {
  createAdminService,
  deleteAdminService,
  updateAdminService,
} from '@/actions/admin/services';
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
import { AdminServiceForm } from '@/components/admin/forms/admin-service-form';
import { isCmsDatabaseConfigured } from '@/server/cms/database';
import { getAdminListQuery, getAdminServices } from '@/server/cms/queries';

type ServicesPageProps = Readonly<{
  readonly searchParams: Promise<Readonly<Record<string, string | string[] | undefined>>>;
}>;

export default async function AdminServicesPage({
  searchParams,
}: ServicesPageProps): Promise<React.JSX.Element> {
  const params = await searchParams;
  const query = getAdminListQuery(params['search'], params['page']);
  const [services, databaseConfigured] = await Promise.all([
    getAdminServices(query),
    Promise.resolve(isCmsDatabaseConfigured()),
  ]);

  return (
    <>
      <AdminPageHeader
        description="明确服务边界、交付内容和适用场景，让潜在客户能快速判断是否匹配。"
        eyebrow="CONTENT / SERVICES"
        title="服务内容"
      />
      <AdminFormFeedback error={params['error']} success={params['success']} />
      {!databaseConfigured ? <AdminSetupNotice /> : null}
      <section className="admin-panel">
        <div className="admin-panel-header">
          <div>
            <p className="admin-kicker">CREATE</p>
            <h2>新增服务</h2>
          </div>
        </div>
        <div className="admin-panel-body">
          <AdminServiceForm action={createAdminService} submitLabel="创建服务" />
        </div>
      </section>
      <section className="admin-panel">
        <div className="admin-panel-header">
          <div>
            <p className="admin-kicker">OFFERINGS</p>
            <h2>服务列表</h2>
          </div>
          <AdminSearchForm action="/admin/services" search={query.search} />
        </div>
        {services.length === 0 ? (
          <div className="admin-panel-body">
            <AdminEmptyState>
              暂无服务。先建立最能代表你当前能力和获客方向的服务项。
            </AdminEmptyState>
          </div>
        ) : (
          <div className="admin-data-table-wrap">
            <table className="admin-data-table">
              <thead>
                <tr>
                  <th scope="col">服务</th>
                  <th scope="col">分类</th>
                  <th scope="col">首页展示</th>
                  <th scope="col">语言</th>
                  <th scope="col">更新时间</th>
                  <th scope="col">操作</th>
                </tr>
              </thead>
              <tbody>
                {services.map((service) => (
                  <tr key={service.id}>
                    <td>
                      <span className="admin-data-title">
                        {service.title}
                        <small>/{service.slug}</small>
                      </span>
                    </td>
                    <td>{service.category}</td>
                    <td>
                      <span className="admin-status-badge">
                        {service.featured ? '精选' : '普通'}
                      </span>
                    </td>
                    <td>{service.locale === 'en-US' ? 'EN' : '中文'}</td>
                    <td>
                      <time dateTime={service.updatedAt.toISOString()}>
                        {formatAdminDate(service.updatedAt)}
                      </time>
                    </td>
                    <td>
                      <div className="admin-row-actions">
                        <details className="admin-details">
                          <summary>编辑</summary>
                          <AdminServiceForm
                            action={updateAdminService}
                            submitLabel="保存服务"
                            values={{
                              category: service.category,
                              content: service.content,
                              description: service.description,
                              featured: service.featured,
                              id: service.id,
                              locale: service.locale === 'en-US' ? 'en-US' : 'zh-CN',
                              slug: service.slug,
                              title: service.title,
                              translationGroup: service.translationGroup,
                            }}
                          />
                        </details>
                        <AdminDeleteForm
                          action={deleteAdminService}
                          id={service.id}
                          resourceLabel={`服务「${service.title}」`}
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
          itemCount={services.length}
          page={query.page}
          pathname="/admin/services"
          search={query.search}
        />
      </section>
    </>
  );
}
