import { getAiAutomationAgentLabel } from '@/ai/automation-types';
import type { AiCenterData } from '@/server/ai/queries';

type AiMetricGridProps = Readonly<{
  readonly metrics: AiCenterData['metrics'];
}>;

export function AiMetricGrid({ metrics }: AiMetricGridProps): React.JSX.Element {
  return (
    <section aria-label="近 30 天 AI 调用概览" className="ai-metric-grid">
      <article className="admin-stat-card">
        <p>AI CALLS / 30D</p>
        <strong>{metrics.calls}</strong>
      </article>
      <article className="admin-stat-card">
        <p>SUCCESS RATE</p>
        <strong>{metrics.successRate}%</strong>
      </article>
      <article className="admin-stat-card">
        <p>COMPLETED</p>
        <strong>{metrics.successfulCalls}</strong>
      </article>
      <article className="admin-stat-card ai-metric-breakdown">
        <p>MODULES</p>
        {metrics.usageByAgent.length === 0 ? (
          <span>尚无调用记录</span>
        ) : (
          <ul>
            {metrics.usageByAgent.map((item) => (
              <li key={item.agent}>
                <span>{getAiAutomationAgentLabel(item.agent)}</span>
                <strong>{item.value}</strong>
              </li>
            ))}
          </ul>
        )}
      </article>
    </section>
  );
}
