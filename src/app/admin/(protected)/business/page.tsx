import {
  AdminEmptyState,
  AdminPageHeader,
  AdminSetupNotice,
} from '@/components/admin/admin-page-primitives';
import { BusinessMetrics } from '@/components/saas/business-metrics';
import { isCmsDatabaseConfigured } from '@/server/cms/database';
import { getBusinessAdminOverview } from '@/server/saas/business-admin';

export const dynamic = 'force-dynamic';

export default async function BusinessAdminPage(): Promise<React.JSX.Element> {
  const [databaseConfigured, overview] = await Promise.all([
    Promise.resolve(isCmsDatabaseConfigured()),
    getBusinessAdminOverview(),
  ]);

  return (
    <>
      <AdminPageHeader
        description="用真实订阅、组织与使用量数据判断商业化进展；不展示模拟收入或虚假增长。"
        eyebrow="SAAS / BUSINESS"
        title="商业数据"
      />
      {!databaseConfigured ? <AdminSetupNotice /> : null}
      <BusinessMetrics overview={overview} />
      <section className="admin-panel">
        <div className="admin-panel-header">
          <div>
            <p className="admin-kicker">PRODUCT USAGE / {overview?.usagePeriod ?? '—'}</p>
            <h2>本周期产品使用</h2>
          </div>
        </div>
        <div className="admin-panel-body">
          {overview === undefined || overview.usage.length === 0 ? (
            <AdminEmptyState>当前周期还没有可用于汇总的产品使用数据。</AdminEmptyState>
          ) : (
            <ul className="saas-business-usage-list">
              {overview.usage.map((item) => (
                <li key={item.feature}>
                  <span>{getUsageLabel(item.feature)}</span>
                  <strong>{item.count.toLocaleString('zh-CN')}</strong>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </>
  );
}

function getUsageLabel(feature: string): string {
  switch (feature) {
    case 'aiMessages':
      return 'AI 调用';
    default:
      return feature;
  }
}
