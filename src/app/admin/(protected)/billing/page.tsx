import { AdminPageHeader, AdminSetupNotice } from '@/components/admin/admin-page-primitives';
import { BillingAdminTables } from '@/components/saas/billing-admin-tables';
import { BusinessMetrics } from '@/components/saas/business-metrics';
import { isCmsDatabaseConfigured } from '@/server/cms/database';
import { getBusinessAdminOverview } from '@/server/saas/business-admin';

export const dynamic = 'force-dynamic';

export default async function BillingAdminPage(): Promise<React.JSX.Element> {
  const [databaseConfigured, overview] = await Promise.all([
    Promise.resolve(isCmsDatabaseConfigured()),
    getBusinessAdminOverview(),
  ]);

  return (
    <>
      <AdminPageHeader
        description="查看由服务端和 Stripe Webhook 写入的套餐、订阅与支付状态；不在此页编辑价格或伪造订阅。"
        eyebrow="SAAS / BILLING"
        title="账单运营"
      />
      {!databaseConfigured ? <AdminSetupNotice /> : null}
      <BusinessMetrics overview={overview} />
      <BillingAdminTables overview={overview} />
    </>
  );
}
