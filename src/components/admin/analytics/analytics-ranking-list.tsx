import type { AnalyticsRanking } from '@/server/analytics/queries';

export type AnalyticsRankingListProps = Readonly<{
  readonly emptyMessage: string;
  readonly eyebrow: string;
  readonly items: readonly AnalyticsRanking[];
  readonly title: string;
}>;

export function AnalyticsRankingList({
  emptyMessage,
  eyebrow,
  items,
  title,
}: AnalyticsRankingListProps): React.JSX.Element {
  return (
    <section className="analytics-card ranking-list">
      <div className="analytics-card-heading">
        <div>
          <p className="admin-kicker">{eyebrow}</p>
          <h2>{title}</h2>
        </div>
      </div>
      {items.length === 0 ? (
        <p className="analytics-empty-state">{emptyMessage}</p>
      ) : (
        <ol>
          {items.map((item, index) => (
            <li key={item.key}>
              <span className="analytics-ranking-index">{String(index + 1).padStart(2, '0')}</span>
              <span className="analytics-ranking-copy">
                <strong>{item.label}</strong>
                <small>{item.detail}</small>
              </span>
              <span className="analytics-ranking-value">{item.value}</span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
