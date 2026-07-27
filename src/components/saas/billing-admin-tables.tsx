import { AdminEmptyState } from '@/components/admin/admin-page-primitives';
import {
  billingCycleLabels,
  formatBillingAmount,
  formatBillingDate,
  paymentStatusLabels,
  subscriptionStatusLabels,
} from '@/lib/billing-presentation';
import type { BusinessAdminOverview } from '@/server/saas/business-admin';

type BillingAdminTablesProps = Readonly<{
  readonly overview: BusinessAdminOverview | undefined;
}>;

export function BillingAdminTables({ overview }: BillingAdminTablesProps): React.JSX.Element {
  return (
    <div className="saas-billing-admin-tables">
      <section className="admin-panel">
        <div className="admin-panel-header">
          <div>
            <p className="admin-kicker">PLANS</p>
            <h2>套餐与订阅数量</h2>
          </div>
        </div>
        <div className="admin-data-table-wrap">
          {overview === undefined || overview.plans.length === 0 ? (
            <div className="admin-panel-body">
              <AdminEmptyState>尚未连接可读取的套餐数据。</AdminEmptyState>
            </div>
          ) : (
            <table className="admin-data-table">
              <thead>
                <tr>
                  <th>套餐</th>
                  <th>价格</th>
                  <th>周期</th>
                  <th>订阅</th>
                  <th>状态</th>
                </tr>
              </thead>
              <tbody>
                {overview.plans.map((plan) => (
                  <tr key={plan.slug}>
                    <td>
                      <span className="admin-data-title">
                        {plan.name}
                        <small>{plan.slug}</small>
                      </span>
                    </td>
                    <td>
                      {plan.slug === 'enterprise'
                        ? '联系定制'
                        : formatBillingAmount(plan.priceCents, 'CNY')}
                    </td>
                    <td>{billingCycleLabels[plan.billingCycle]}</td>
                    <td>{plan.subscriptionCount}</td>
                    <td>{plan.active ? '可售' : '已停用'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
      <section className="admin-panel">
        <div className="admin-panel-header">
          <div>
            <p className="admin-kicker">SUBSCRIPTIONS</p>
            <h2>近期订阅状态</h2>
          </div>
        </div>
        <div className="admin-data-table-wrap">
          {overview === undefined || overview.recentSubscriptions.length === 0 ? (
            <div className="admin-panel-body">
              <AdminEmptyState>还没有订阅记录。</AdminEmptyState>
            </div>
          ) : (
            <table className="admin-data-table">
              <thead>
                <tr>
                  <th>企业</th>
                  <th>套餐</th>
                  <th>状态</th>
                  <th>当前周期结束</th>
                  <th>创建时间</th>
                </tr>
              </thead>
              <tbody>
                {overview.recentSubscriptions.map((subscription) => (
                  <tr key={subscription.id}>
                    <td>{subscription.organizationName}</td>
                    <td>{subscription.planName}</td>
                    <td>
                      {subscriptionStatusLabels[subscription.status]}
                      {subscription.cancelAtPeriodEnd ? ' / 已预约取消' : ''}
                    </td>
                    <td>
                      {subscription.currentPeriodEndsAt === null
                        ? '未设置'
                        : formatBillingDate(subscription.currentPeriodEndsAt.toISOString())}
                    </td>
                    <td>{formatBillingDate(subscription.createdAt.toISOString())}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
      <section className="admin-panel">
        <div className="admin-panel-header">
          <div>
            <p className="admin-kicker">PAYMENTS</p>
            <h2>近期支付记录</h2>
          </div>
        </div>
        <div className="admin-data-table-wrap">
          {overview === undefined || overview.recentPayments.length === 0 ? (
            <div className="admin-panel-body">
              <AdminEmptyState>Webhook 写入成功的支付记录会显示在这里。</AdminEmptyState>
            </div>
          ) : (
            <table className="admin-data-table">
              <thead>
                <tr>
                  <th>企业</th>
                  <th>套餐</th>
                  <th>金额</th>
                  <th>状态</th>
                  <th>时间</th>
                </tr>
              </thead>
              <tbody>
                {overview.recentPayments.map((payment) => (
                  <tr key={payment.id}>
                    <td>{payment.organizationName}</td>
                    <td>{payment.planName}</td>
                    <td>{formatBillingAmount(payment.amountCents, payment.currency)}</td>
                    <td>{paymentStatusLabels[payment.status]}</td>
                    <td>{formatBillingDate(payment.createdAt.toISOString())}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}
