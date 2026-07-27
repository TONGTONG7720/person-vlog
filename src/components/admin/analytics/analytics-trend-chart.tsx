import type { AnalyticsTrendPoint } from '@/server/analytics/queries';

export type AnalyticsTrendChartProps = Readonly<{
  readonly trend: readonly AnalyticsTrendPoint[];
}>;

export function AnalyticsTrendChart({ trend }: AnalyticsTrendChartProps): React.JSX.Element {
  const maximumPageViews = Math.max(1, ...trend.map((point) => point.pageViews));

  return (
    <section aria-labelledby="analytics-trend-title" className="analytics-card chart-card">
      <div className="analytics-card-heading">
        <div>
          <p className="admin-kicker">TRAFFIC</p>
          <h2 id="analytics-trend-title">访问趋势</h2>
        </div>
        <span>PV</span>
      </div>
      <div className="analytics-trend" role="img" aria-label="按日期展示的页面访问趋势">
        {trend.map((point) => {
          const height = Math.max(4, Math.round((point.pageViews / maximumPageViews) * 100));

          return (
            <div className="analytics-trend-column" key={point.date}>
              <span className="analytics-trend-value">{point.pageViews}</span>
              <div className="analytics-trend-bar-track">
                <span className="analytics-trend-bar" style={{ height: `${height}%` }} />
              </div>
              <span className="analytics-trend-label">{point.label}</span>
            </div>
          );
        })}
      </div>
      <p className="analytics-card-note">
        为保护隐私，此站不建立跨会话用户画像，因此不展示伪精确的 UV。
      </p>
    </section>
  );
}
