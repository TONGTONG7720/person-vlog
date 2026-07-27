'use client';

import { ArrowUpRight, CreditCard, LoaderCircle, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { z } from 'zod';

import {
  billingUsageFeatureLabels,
  formatBillingDate,
  formatBillingPrice,
  formatBillingUsageLimit,
  subscriptionStatusLabels,
} from '@/lib/billing-presentation';
import type { PlanLimitFeature } from '@/lib/permissions';
import type { BillingPlanView } from '@/server/saas/billing/entitlements';

export type BillingOverviewView = Readonly<{
  readonly subscription: Readonly<{
    readonly cancelAtPeriodEnd: boolean;
    readonly currentPeriodEndsAt: string | undefined;
    readonly status: keyof typeof subscriptionStatusLabels;
    readonly trialEndsAt: string | undefined;
  }>;
  readonly usage: readonly Readonly<{
    readonly feature: PlanLimitFeature;
    readonly limit: number | null;
    readonly used: number;
  }>[];
  readonly usagePeriod: string;
}>;

type BillingOverviewProps = Readonly<{
  readonly canManage: boolean;
  readonly organizationSlug: string;
  readonly plan: BillingPlanView;
  readonly plans: readonly BillingPlanView[];
  readonly summary: BillingOverviewView;
}>;

type BillingRequest =
  | Readonly<{ readonly action: 'cancel' }>
  | Readonly<{ readonly action: 'checkout'; readonly planSlug: string }>;

type BillingRequestState =
  | Readonly<{ readonly kind: 'idle' }>
  | Readonly<{ readonly kind: 'loading'; readonly message: string }>
  | Readonly<{ readonly kind: 'success'; readonly message: string }>
  | Readonly<{ readonly kind: 'error'; readonly message: string }>;

const cancellationResponseSchema = z.object({ kind: z.literal('cancellation-scheduled') });
const checkoutResponseSchema = z.object({ kind: z.literal('checkout'), url: z.string().url() });
const subscriptionResponseSchema = z.discriminatedUnion('kind', [
  cancellationResponseSchema,
  checkoutResponseSchema,
]);
const subscriptionErrorSchema = z.object({ message: z.string().min(1) });

export function BillingOverview({
  canManage,
  organizationSlug,
  plan,
  plans,
  summary,
}: BillingOverviewProps): React.JSX.Element {
  const router = useRouter();
  const [requestState, setRequestState] = useState<BillingRequestState>({ kind: 'idle' });
  const upgradePlans =
    plan.priceCents === 0
      ? plans.filter((candidate) => candidate.priceCents > 0 && candidate.slug !== 'enterprise')
      : [];
  const isRequestInFlight = requestState.kind === 'loading';
  const renewalDate = summary.subscription.currentPeriodEndsAt ?? summary.subscription.trialEndsAt;

  async function requestSubscriptionChange(input: BillingRequest): Promise<void> {
    setRequestState({ kind: 'loading', message: '正在处理账单请求…' });

    try {
      const response = await fetch(
        `/api/v1/subscription?organization=${encodeURIComponent(organizationSlug)}`,
        {
          body: JSON.stringify(input),
          headers: { 'Content-Type': 'application/json' },
          method: 'POST',
          signal: AbortSignal.timeout(15_000),
        },
      );
      const result = await readSubscriptionResponse(response);

      switch (result.kind) {
        case 'cancellation-scheduled':
          setRequestState({ kind: 'success', message: '已预约在当前计费周期结束后取消续费。' });
          router.refresh();

          return;
        case 'checkout':
          window.location.assign(result.url);

          return;
        default:
          return assertNever(result);
      }
    } catch (error) {
      if (
        error instanceof BillingRequestError ||
        error instanceof DOMException ||
        error instanceof TypeError
      ) {
        setRequestState({ kind: 'error', message: toBillingErrorMessage(error) });

        return;
      }

      throw error;
    }
  }

  return (
    <div className="saas-billing-overview">
      <section aria-labelledby="billing-plan-heading" className="saas-billing-summary-panel">
        <div className="saas-billing-summary-header">
          <div>
            <p className="saas-kicker">CURRENT PLAN</p>
            <h2 id="billing-plan-heading">{plan.name}</h2>
          </div>
          <span className="saas-billing-status">
            {subscriptionStatusLabels[summary.subscription.status]}
          </span>
        </div>
        <p className="saas-billing-plan-copy">{plan.description}</p>
        <p className="saas-billing-current-price">{formatBillingPrice(plan)}</p>
        <dl className="saas-billing-facts">
          <div>
            <dt>计费周期</dt>
            <dd>{plan.billingCycle === 'YEARLY' ? '按年' : '按月'}</dd>
          </div>
          <div>
            <dt>{summary.subscription.status === 'TRIALING' ? '试用结束' : '当前周期结束'}</dt>
            <dd>{formatBillingDate(renewalDate)}</dd>
          </div>
        </dl>
        {summary.subscription.cancelAtPeriodEnd ? (
          <p className="saas-inline-feedback" role="status">
            已预约取消续费；在 {formatBillingDate(renewalDate)} 前，现有数据与能力仍可继续使用。
          </p>
        ) : null}
        {canManage ? (
          <div className="saas-billing-actions">
            {upgradePlans.map((candidate) => (
              <button
                className="saas-primary-button"
                disabled={isRequestInFlight}
                key={candidate.slug}
                onClick={() =>
                  void requestSubscriptionChange({ action: 'checkout', planSlug: candidate.slug })
                }
                type="button"
              >
                {isRequestInFlight ? (
                  <LoaderCircle aria-hidden="true" className="saas-inline-spinner" size={16} />
                ) : (
                  <CreditCard aria-hidden="true" size={16} />
                )}
                <span>升级至 {candidate.name}</span>
              </button>
            ))}
            {summary.subscription.status === 'ACTIVE' &&
            !summary.subscription.cancelAtPeriodEnd &&
            upgradePlans.length === 0 ? (
              <Link className="saas-secondary-button" href="/contact">
                <span>沟通企业方案</span>
                <ArrowUpRight aria-hidden="true" size={16} />
              </Link>
            ) : null}
            {summary.subscription.status === 'ACTIVE' && !summary.subscription.cancelAtPeriodEnd ? (
              <button
                className="saas-secondary-button"
                disabled={isRequestInFlight}
                onClick={() => void requestSubscriptionChange({ action: 'cancel' })}
                type="button"
              >
                <XCircle aria-hidden="true" size={16} />
                <span>取消续费</span>
              </button>
            ) : null}
          </div>
        ) : (
          <p className="saas-billing-note">只有企业 Owner 可以变更套餐或管理续费。</p>
        )}
      </section>
      <section aria-labelledby="billing-usage-heading" className="saas-billing-summary-panel">
        <div className="saas-billing-summary-header">
          <div>
            <p className="saas-kicker">USAGE / {summary.usagePeriod}</p>
            <h2 id="billing-usage-heading">当前使用量</h2>
          </div>
        </div>
        <dl className="saas-billing-usage-list">
          {summary.usage.map((item) => {
            const progress = item.limit === null ? undefined : Math.min(item.used, item.limit);

            return (
              <div key={item.feature}>
                <dt>{billingUsageFeatureLabels[item.feature]}</dt>
                <dd>
                  {item.used.toLocaleString('zh-CN')} /{' '}
                  {formatBillingUsageLimit(item.feature, item.limit)}
                </dd>
                {progress === undefined || item.limit === null ? (
                  <span className="saas-billing-unlimited">不限</span>
                ) : (
                  <progress
                    aria-label={`${billingUsageFeatureLabels[item.feature]}使用量`}
                    max={item.limit}
                    value={progress}
                  />
                )}
              </div>
            );
          })}
        </dl>
      </section>
      {requestState.kind === 'idle' ? null : (
        <p
          className={
            requestState.kind === 'error'
              ? 'saas-inline-feedback'
              : 'saas-inline-feedback saas-feedback-success'
          }
          role={requestState.kind === 'error' ? 'alert' : 'status'}
        >
          {requestState.message}
        </p>
      )}
    </div>
  );
}

async function readSubscriptionResponse(response: Response) {
  let payload: unknown;

  try {
    payload = await response.json();
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new BillingRequestError('账单服务返回了无法识别的响应。');
    }

    throw error;
  }

  const success = subscriptionResponseSchema.safeParse(payload);

  if (response.ok && success.success) {
    return success.data;
  }

  const failure = subscriptionErrorSchema.safeParse(payload);
  throw new BillingRequestError(failure.success ? failure.data.message : '暂时无法完成账单操作。');
}

function toBillingErrorMessage(error: BillingRequestError | DOMException | TypeError): string {
  if (error instanceof BillingRequestError) {
    return error.message;
  }

  return '账单服务连接超时，请稍后再试。';
}

function assertNever(value: never): never {
  throw new BillingRequestError(`未知账单响应：${String(value)}`);
}

class BillingRequestError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = 'BillingRequestError';
  }
}
