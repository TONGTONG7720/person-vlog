import { AboutMetricCard } from '@/components/sections/about/about-metric-card';
import type { AboutMetric } from '@/types/about';

export type AboutMetricsProps = Readonly<{
  metrics: readonly AboutMetric[];
  title: string;
}>;

export function AboutMetrics({ metrics, title }: AboutMetricsProps): React.JSX.Element {
  return (
    <section aria-labelledby="about-metrics-heading" className="about-metrics">
      <div className="about-metrics-heading">
        <h3 id="about-metrics-heading">{title}</h3>
      </div>
      <dl className="about-metrics-grid">
        {metrics.map((metric) => (
          <AboutMetricCard key={metric.id} metric={metric} />
        ))}
      </dl>
    </section>
  );
}
