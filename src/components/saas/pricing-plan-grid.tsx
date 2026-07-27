import { ArrowUpRight, Check } from 'lucide-react';
import Link from 'next/link';

import {
  billingCycleLabels,
  formatBillingPrice,
  formatBillingUsageLimit,
} from '@/lib/billing-presentation';
import type { BillingPlanView } from '@/server/saas/billing/entitlements';

type PricingPlanGridProps = Readonly<{
  readonly plans: readonly BillingPlanView[];
}>;

const pricingLimitOrder = [
  'workspaces',
  'projects',
  'members',
  'aiMessages',
  'storageBytes',
] as const;

export function PricingPlanGrid({ plans }: PricingPlanGridProps): React.JSX.Element {
  return (
    <div aria-label="SaaS 套餐" className="saas-pricing-grid">
      {plans.map((plan) => {
        const action = getPricingAction(plan.slug);
        const highlights = getPlanHighlights(plan);

        return (
          <article
            className="saas-pricing-card"
            data-recommended={plan.slug === 'pro'}
            key={plan.slug}
          >
            <div className="saas-pricing-card-header">
              <div>
                <p className="saas-kicker">{plan.slug.toLocaleUpperCase('en-US')}</p>
                <h2>{plan.name}</h2>
              </div>
              {plan.slug === 'pro' ? (
                <span className="saas-pricing-recommendation">个人开发者常用</span>
              ) : null}
            </div>
            <p className="saas-pricing-description">{plan.description}</p>
            <div className="saas-pricing-price">
              <strong>{formatBillingPrice(plan)}</strong>
              {plan.priceCents > 0 ? <span>/ {billingCycleLabels[plan.billingCycle]}</span> : null}
            </div>
            {plan.trialDays > 0 && plan.slug !== 'enterprise' ? (
              <p className="saas-pricing-trial">新空间可先体验 {plan.trialDays} 天。</p>
            ) : null}
            <ul className="saas-pricing-feature-list">
              {highlights.map((highlight) => (
                <li key={highlight}>
                  <Check aria-hidden="true" size={16} strokeWidth={1.75} />
                  <span>{highlight}</span>
                </li>
              ))}
            </ul>
            <Link
              className={plan.slug === 'pro' ? 'saas-primary-button' : 'saas-secondary-button'}
              href={action.href}
            >
              <span>{action.label}</span>
              <ArrowUpRight aria-hidden="true" size={16} strokeWidth={1.75} />
            </Link>
          </article>
        );
      })}
    </div>
  );
}

function getPlanHighlights(plan: BillingPlanView): readonly string[] {
  const limits = pricingLimitOrder.map((feature) =>
    formatBillingUsageLimit(feature, plan.entitlements.limits[feature]),
  );
  const capabilities = [
    ...(plan.entitlements.features.privateKnowledge ? ['私有项目知识库'] : []),
    ...(plan.entitlements.features.apiAccess ? ['API Access 预留'] : []),
    ...(plan.entitlements.features.prioritySupport ? ['优先支持'] : []),
  ];

  return [...limits, ...capabilities];
}

function getPricingAction(
  slug: string,
): Readonly<{ readonly href: string; readonly label: string }> {
  switch (slug) {
    case 'enterprise':
      return { href: '/contact', label: '沟通企业方案' };
    case 'free':
      return { href: '/signup', label: '创建免费空间' };
    default:
      return { href: '/signup', label: '创建空间后升级' };
  }
}
