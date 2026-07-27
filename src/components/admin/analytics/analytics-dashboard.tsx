import Link from 'next/link';

import { AnalyticsFunnelChart } from '@/components/admin/analytics/analytics-funnel-chart';
import { AnalyticsMetricCard } from '@/components/admin/analytics/analytics-metric-card';
import { AnalyticsRankingList } from '@/components/admin/analytics/analytics-ranking-list';
import { AnalyticsTrendChart } from '@/components/admin/analytics/analytics-trend-chart';
import type { AdminAnalyticsData, AnalyticsRange } from '@/server/analytics/queries';

const rangeOptions: readonly Readonly<{
  readonly label: string;
  readonly value: AnalyticsRange;
}>[] = [
  { label: '今日', value: 'today' },
  { label: '7 天', value: '7d' },
  { label: '30 天', value: '30d' },
];

export type AnalyticsDashboardProps = Readonly<{
  readonly data: AdminAnalyticsData;
}>;

export function AnalyticsDashboard({ data }: AnalyticsDashboardProps): React.JSX.Element {
  return (
    <div className="analytics-dashboard">
      <nav aria-label="分析时间范围" className="analytics-range-switcher">
        {rangeOptions.map((option) => (
          <Link
            aria-current={data.range === option.value ? 'page' : undefined}
            data-active={data.range === option.value}
            href={`/admin/analytics?range=${option.value}`}
            key={option.value}
          >
            {option.label}
          </Link>
        ))}
      </nav>

      <section aria-label="访问总览" className="analytics-visit-summary">
        <AnalyticsMetricCard
          detail="当前自然日的页面访问"
          label="今日访问"
          value={data.visits.today}
        />
        <AnalyticsMetricCard
          detail="包含今日的最近 7 天"
          label="本周访问"
          value={data.visits.week}
        />
        <AnalyticsMetricCard
          detail="包含今日的最近 30 天"
          label="本月访问"
          value={data.visits.month}
        />
      </section>

      <section aria-label="当前范围核心指标" className="analytics-metric-grid">
        <AnalyticsMetricCard
          detail="项目详情页被查看"
          label="项目查看"
          value={data.metrics.projectViews}
        />
        <AnalyticsMetricCard
          detail="文章详情页被阅读"
          label="文章阅读"
          value={data.metrics.articleReads}
        />
        <AnalyticsMetricCard
          detail="联系表单成功提交"
          label="咨询提交"
          value={data.metrics.contactSubmissions}
        />
        <AnalyticsMetricCard
          detail="不保存问题正文"
          label="AI 使用"
          value={data.metrics.assistantUses}
        />
      </section>

      <div className="analytics-primary-grid">
        <AnalyticsTrendChart trend={data.trend} />
        <AnalyticsFunnelChart steps={data.funnel} />
      </div>

      <div className="analytics-ranking-grid">
        <AnalyticsRankingList
          emptyMessage="还没有项目详情查看事件。"
          eyebrow="PROJECTS"
          items={data.projectRankings}
          title="热门项目"
        />
        <AnalyticsRankingList
          emptyMessage="还没有文章阅读事件。"
          eyebrow="BLOG"
          items={data.articleRankings}
          title="热门文章与阅读质量"
        />
        <AnalyticsRankingList
          emptyMessage="还没有服务浏览事件。"
          eyebrow="SERVICES"
          items={data.serviceRankings}
          title="最受关注服务"
        />
        <AnalyticsRankingList
          emptyMessage="还没有联系按钮点击事件。"
          eyebrow="CONTACT"
          items={data.contactSources}
          title="咨询来源"
        />
        <AnalyticsRankingList
          emptyMessage="还没有 AI 助手使用事件。"
          eyebrow="ASSISTANT"
          items={data.assistantCategories}
          title="AI 咨询分类"
        />
        <AnalyticsRankingList
          emptyMessage="还没有公开页面访问事件。"
          eyebrow="PAGES"
          items={data.pageRankings}
          title="热门页面"
        />
        <AnalyticsRankingList
          emptyMessage="还没有可用的语言访问数据。"
          eyebrow="LANGUAGE"
          items={data.languageRankings}
          title="中文与英文访问"
        />
      </div>
    </div>
  );
}
