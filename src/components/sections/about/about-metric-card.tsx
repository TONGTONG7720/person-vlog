import { AboutAnimatedValue } from '@/components/sections/about/about-animated-value';
import type { AboutMetric } from '@/types/about';

export type AboutMetricCardProps = Readonly<{
  metric: AboutMetric;
}>;

export function AboutMetricCard({ metric }: AboutMetricCardProps): React.JSX.Element {
  return (
    <div className="about-metric-card">
      <dd className="about-metric-value">
        {metric.numericValue === undefined ? (
          metric.value
        ) : (
          <AboutAnimatedValue value={metric.numericValue} />
        )}
      </dd>
      <dt className="about-metric-label">{metric.label}</dt>
      <dd className="about-metric-description">{metric.description}</dd>
    </div>
  );
}
