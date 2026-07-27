import { formatBillingAmount, formatBillingPercentage } from '@/lib/billing-presentation';
import type { BusinessAdminOverview } from '@/server/saas/business-admin';

type BusinessMetricsProps = Readonly<{
  readonly overview: BusinessAdminOverview | undefined;
}>;

export function BusinessMetrics({ overview }: BusinessMetricsProps): React.JSX.Element {
  const metrics = overview?.metrics;

  return (
    <section aria-label="商业指标" className="saas-business-metric-grid">
      <article className="admin-stat-card">
        <p>MRR</p>
        <strong>
          {metrics === undefined
            ? '—'
            : formatBillingAmount(metrics.monthlyRecurringRevenueCents, 'CNY')}
        </strong>
        <span>当前活跃订阅的月度经常性收入</span>
      </article>
      <article className="admin-stat-card">
        <p>ARR</p>
        <strong>
          {metrics === undefined
            ? '—'
            : formatBillingAmount(metrics.annualRecurringRevenueCents, 'CNY')}
        </strong>
        <span>根据当前 MRR 计算的年度化收入</span>
      </article>
      <article className="admin-stat-card">
        <p>付费客户</p>
        <strong>{metrics?.activeCustomerCount ?? '—'}</strong>
        <span>试用组织 {metrics?.trialOrganizationCount ?? '—'} 个</span>
      </article>
      <article className="admin-stat-card">
        <p>注册转化</p>
        <strong>
          {metrics === undefined ? '—' : formatBillingPercentage(metrics.conversionRatePercent)}
        </strong>
        <span>已注册组织转为付费客户的比例</span>
      </article>
      <article className="admin-stat-card">
        <p>最近 30 天新增</p>
        <strong>{metrics?.newSubscriptionCount ?? '—'}</strong>
        <span>新注册组织 {metrics?.newOrganizationCount ?? '—'} 个</span>
      </article>
      <article className="admin-stat-card">
        <p>最近 30 天流失</p>
        <strong>
          {metrics === undefined ? '—' : formatBillingPercentage(metrics.churnRatePercent)}
        </strong>
        <span>按取消事件与当前活跃订阅计算</span>
      </article>
    </section>
  );
}
