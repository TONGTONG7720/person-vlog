import Link from 'next/link';

import {
  AdminEmptyState,
  AdminPageHeader,
  AdminSetupNotice,
} from '@/components/admin/admin-page-primitives';
import { isCmsDatabaseConfigured } from '@/server/cms/database';
import { getAdminTranslationOverview } from '@/server/cms/queries';

const managementLinks = [
  { href: '/admin/projects', label: '项目案例' },
  { href: '/admin/blog', label: '技术文章' },
  { href: '/admin/services', label: '服务内容' },
] as const;

export default async function AdminTranslationsPage(): Promise<React.JSX.Element> {
  const overview = await getAdminTranslationOverview();

  return (
    <>
      <AdminPageHeader
        description="为中文与英文内容设置语言和同一翻译组，公开站会按访问语言读取对应版本。"
        eyebrow="CONTENT / TRANSLATIONS"
        title="多语言内容管理"
      />
      {!isCmsDatabaseConfigured() ? <AdminSetupNotice /> : null}
      <section className="admin-panel">
        <div className="admin-panel-header">
          <div>
            <p className="admin-kicker">WORKFLOW</p>
            <h2>创建与关联翻译</h2>
          </div>
        </div>
        <div className="admin-panel-body">
          <ol className="admin-translation-steps">
            <li>在内容编辑表单中选择中文或 English。</li>
            <li>为同一内容的两个版本填写相同的“翻译组”。</li>
            <li>保存后，本页会显示语言覆盖情况；访客将从 / 或 /en 读取对应版本。</li>
          </ol>
          <div className="admin-row-actions">
            {managementLinks.map((link) => (
              <Link className="admin-secondary-button" href={link.href} key={link.href}>
                管理{link.label}
              </Link>
            ))}
          </div>
        </div>
      </section>
      <section className="admin-panel">
        <div className="admin-panel-header">
          <div>
            <p className="admin-kicker">TRANSLATION GROUPS</p>
            <h2>已关联内容</h2>
          </div>
        </div>
        {overview === undefined || overview.groups.length === 0 ? (
          <div className="admin-panel-body">
            <AdminEmptyState>
              尚未发现已关联的翻译组。创建双语内容后，为两个版本填入相同翻译组即可。
            </AdminEmptyState>
          </div>
        ) : (
          <div className="admin-data-table-wrap">
            <table className="admin-data-table">
              <thead>
                <tr>
                  <th scope="col">翻译组</th>
                  <th scope="col">中文版本</th>
                  <th scope="col">英文版本</th>
                  <th scope="col">完成度</th>
                </tr>
              </thead>
              <tbody>
                {overview.groups.map((group) => {
                  const chinese = group.records.filter((record) => record.locale === 'zh-CN');
                  const english = group.records.filter((record) => record.locale === 'en-US');
                  const complete = chinese.length > 0 && english.length > 0;

                  return (
                    <tr key={group.id}>
                      <td>
                        <code>{group.id}</code>
                      </td>
                      <td>{formatRecords(chinese)}</td>
                      <td>{formatRecords(english)}</td>
                      <td>
                        <span className="admin-status-badge">
                          {complete ? '中英齐全' : '待补齐'}
                        </span>
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
            <p className="admin-kicker">UNASSIGNED</p>
            <h2>尚未关联的内容</h2>
          </div>
        </div>
        {overview === undefined || overview.unassigned.length === 0 ? (
          <div className="admin-panel-body">
            <AdminEmptyState>所有已入库内容均已设置翻译组，或当前 CMS 仍未连接。</AdminEmptyState>
          </div>
        ) : (
          <div className="admin-panel-body admin-translation-unassigned">
            {overview.unassigned.map((record) => (
              <p key={`${record.resource}-${record.slug}-${record.locale}`}>
                <strong>{record.resource}</strong> · {record.locale === 'en-US' ? 'EN' : '中文'} ·{' '}
                {record.title}
                <span>/{record.slug}</span>
              </p>
            ))}
          </div>
        )}
      </section>
    </>
  );
}

function formatRecords(
  records: readonly Readonly<{
    readonly resource: string;
    readonly slug: string;
    readonly title: string;
  }>[],
): string {
  return records.length === 0
    ? '—'
    : records.map((record) => `${record.resource}：${record.title} (/${record.slug})`).join('；');
}
