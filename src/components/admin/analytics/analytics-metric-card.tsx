export type AnalyticsMetricCardProps = Readonly<{
  readonly detail: string;
  readonly label: string;
  readonly value: number;
}>;

export function AnalyticsMetricCard({
  detail,
  label,
  value,
}: AnalyticsMetricCardProps): React.JSX.Element {
  return (
    <article className="analytics-card metric-card">
      <p>{label}</p>
      <strong>{value}</strong>
      <span>{detail}</span>
    </article>
  );
}
