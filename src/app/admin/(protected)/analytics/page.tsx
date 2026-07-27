import { AnalyticsDashboard } from '@/components/admin/analytics/analytics-dashboard';
import { AdminPageHeader, AdminSetupNotice } from '@/components/admin/admin-page-primitives';
import { getAdminAnalyticsData, parseAnalyticsRange } from '@/server/analytics/queries';

type AdminAnalyticsPageProps = Readonly<{
  readonly searchParams: Promise<Readonly<Record<string, string | string[] | undefined>>>;
}>;

export default async function AdminAnalyticsPage({
  searchParams,
}: AdminAnalyticsPageProps): Promise<React.JSX.Element> {
  const params = await searchParams;
  const range = parseAnalyticsRange(params['range']);
  const analytics = await getAdminAnalyticsData(range);

  return (
    <>
      <AdminPageHeader
        description="用最少的数据识别内容热度与合作转化；不记录访客身份、表单正文或 AI 对话正文。"
        eyebrow="GROWTH / ANALYTICS"
        title="增长分析"
      />
      {analytics === undefined ? <AdminSetupNotice /> : <AnalyticsDashboard data={analytics} />}
    </>
  );
}
