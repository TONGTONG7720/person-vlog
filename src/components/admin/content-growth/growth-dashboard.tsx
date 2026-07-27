import { AnalyticsMetricCard } from '@/components/admin/analytics/analytics-metric-card';
import { AnalyticsRankingList } from '@/components/admin/analytics/analytics-ranking-list';
import { ContentCalendar } from '@/components/admin/content-growth/content-calendar';
import type { AdminContentGrowthData } from '@/server/analytics/growth-queries';

type GrowthDashboardProps = Readonly<{
  readonly data: AdminContentGrowthData;
}>;

export function GrowthDashboard({ data }: GrowthDashboardProps): React.JSX.Element {
  return (
    <div className="analytics-dashboard content-growth-dashboard">
      <section aria-label="内容增长指标" className="analytics-metric-grid">
        <AnalyticsMetricCard
          detail="当前公开博客中的已发布文章"
          label="已发布内容"
          value={data.metrics.publishedContent}
        />
        <AnalyticsMetricCard
          detail="匿名文章详情阅读事件"
          label="内容阅读"
          value={data.metrics.totalReads}
        />
        <AnalyticsMetricCard
          detail="文章跳转到项目、服务或联系页"
          label="内容转化"
          value={data.metrics.contentConversions}
        />
      </section>
      <div className="analytics-ranking-grid">
        <AnalyticsRankingList
          emptyMessage="还没有文章阅读事件，暂时无法判断热门分类。"
          eyebrow="READING"
          items={data.categoryRankings}
          title="热门内容分类"
        />
        <AnalyticsRankingList
          emptyMessage="还没有文章到项目、服务或联系页的跳转事件。"
          eyebrow="CONTENT → ACTION"
          items={data.conversionRankings}
          title="内容转化路径"
        />
      </div>
      <section className="analytics-card content-growth-calendar-panel">
        <div className="analytics-card-heading">
          <div>
            <p className="admin-kicker">UPCOMING</p>
            <h2>近期内容排期</h2>
          </div>
        </div>
        <ContentCalendar plans={data.plans} />
      </section>
    </div>
  );
}
