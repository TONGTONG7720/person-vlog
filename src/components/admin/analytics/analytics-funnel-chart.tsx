import type { AnalyticsFunnelStep } from '@/server/analytics/queries';

export type AnalyticsFunnelChartProps = Readonly<{
  readonly steps: readonly AnalyticsFunnelStep[];
}>;

export function AnalyticsFunnelChart({ steps }: AnalyticsFunnelChartProps): React.JSX.Element {
  const initialValue = steps[0]?.value ?? 0;

  return (
    <section aria-labelledby="analytics-funnel-title" className="analytics-card funnel-chart">
      <div className="analytics-card-heading">
        <div>
          <p className="admin-kicker">CONVERSION</p>
          <h2 id="analytics-funnel-title">匿名转化漏斗</h2>
        </div>
        <span>事件量</span>
      </div>
      <ol className="analytics-funnel-list">
        {steps.map((step, index) => {
          const percent =
            initialValue === 0 ? undefined : Math.round((step.value / initialValue) * 100);

          return (
            <li key={step.label}>
              <span className="analytics-funnel-index">{String(index + 1).padStart(2, '0')}</span>
              <span className="analytics-funnel-label">{step.label}</span>
              <strong>{step.value}</strong>
              <span className="analytics-funnel-percent">
                {percent === undefined ? '—' : `${percent}%`}
              </span>
            </li>
          );
        })}
      </ol>
      <p className="analytics-card-note">这是隐私友好的事件量漏斗，不用于识别或追踪具体个人。</p>
    </section>
  );
}
