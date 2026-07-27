import { deleteAdminSetting, upsertAdminSetting } from '@/actions/admin/settings';
import { AdminDeleteForm } from '@/components/admin/admin-delete-form';
import {
  AdminEmptyState,
  AdminFormFeedback,
  AdminPageHeader,
  AdminSetupNotice,
  formatAdminDate,
} from '@/components/admin/admin-page-primitives';
import { AdminSettingForm } from '@/components/admin/forms/admin-setting-form';
import { isCmsDatabaseConfigured } from '@/server/cms/database';
import { getAdminSettings } from '@/server/cms/queries';

export default async function AdminSettingsPage({
  searchParams,
}: Readonly<{
  readonly searchParams: Promise<Readonly<Record<string, string | string[] | undefined>>>;
}>): Promise<React.JSX.Element> {
  const params = await searchParams;
  const [settings, databaseConfigured] = await Promise.all([
    getAdminSettings(),
    Promise.resolve(isCmsDatabaseConfigured()),
  ]);

  return (
    <>
      <AdminPageHeader
        description="维护公开的站点文案、社交资料和 SEO 相关内容。敏感密钥仍只应放在环境变量中。"
        eyebrow="SYSTEM / SETTINGS"
        title="网站配置"
      />
      <AdminFormFeedback error={params['error']} success={params['success']} />
      {!databaseConfigured ? <AdminSetupNotice /> : null}
      <section className="admin-panel">
        <div className="admin-panel-header">
          <div>
            <p className="admin-kicker">CONFIGURATION</p>
            <h2>新增或更新配置</h2>
          </div>
        </div>
        <div className="admin-panel-body">
          <p className="admin-inline-note">
            推荐键：site_title、site_description、seo_keywords、contact_email、github_url、wechat_qr_url。
          </p>
          <AdminSettingForm action={upsertAdminSetting} submitLabel="保存配置" />
        </div>
      </section>
      <section className="admin-panel">
        <div className="admin-panel-header">
          <div>
            <p className="admin-kicker">PUBLIC SETTINGS</p>
            <h2>已保存配置</h2>
          </div>
        </div>
        {settings.length === 0 ? (
          <div className="admin-panel-body">
            <AdminEmptyState>
              暂无数据库配置。现有官网会继续使用代码中的默认安全配置。
            </AdminEmptyState>
          </div>
        ) : (
          <div className="admin-data-table-wrap">
            <table className="admin-data-table">
              <thead>
                <tr>
                  <th scope="col">设置键</th>
                  <th scope="col">设置值</th>
                  <th scope="col">更新时间</th>
                  <th scope="col">操作</th>
                </tr>
              </thead>
              <tbody>
                {settings.map((setting) => (
                  <tr key={setting.id}>
                    <td>
                      <code>{setting.key}</code>
                    </td>
                    <td>{setting.value}</td>
                    <td>
                      <time dateTime={setting.updatedAt.toISOString()}>
                        {formatAdminDate(setting.updatedAt)}
                      </time>
                    </td>
                    <td>
                      <div className="admin-row-actions">
                        <details className="admin-details">
                          <summary>编辑</summary>
                          <AdminSettingForm
                            action={upsertAdminSetting}
                            submitLabel="更新配置"
                            values={{ key: setting.key, value: setting.value }}
                          />
                        </details>
                        <AdminDeleteForm
                          action={deleteAdminSetting}
                          id={setting.id}
                          resourceLabel={`配置「${setting.key}」`}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
