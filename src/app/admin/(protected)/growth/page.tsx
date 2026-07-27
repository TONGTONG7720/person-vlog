import { GrowthDashboard } from '@/components/admin/content-growth/growth-dashboard';
import { AdminPageHeader, AdminSetupNotice } from '@/components/admin/admin-page-primitives';
import { getAdminContentGrowthData } from '@/server/analytics/growth-queries';

export default async function AdminGrowthPage(): Promise<React.JSX.Element> {
  const growth = await getAdminContentGrowthData();

  return (
    <>
      <AdminPageHeader
        description="从真实文章阅读、内部跳转与排期中判断下一步该写什么；不追踪访客身份或搜索输入。"
        eyebrow="CONTENT / INSIGHTS"
        title="内容增长"
      />
      {growth === undefined ? <AdminSetupNotice /> : <GrowthDashboard data={growth} />}
    </>
  );
}
