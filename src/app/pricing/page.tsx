import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

import { PricingPlanGrid } from '@/components/saas/pricing-plan-grid';
import { getRequestLocale } from '@/i18n/server';
import { createMetadata } from '@/lib/metadata';
import { getPublicBillingPlans } from '@/server/saas/billing/entitlements';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  const locale = await getRequestLocale();

  return createMetadata({
    description: '查看协作空间的 Free、Pro、Team 与 Enterprise 套餐、容量边界和升级方式。',
    locale,
    path: '/pricing',
    title: '套餐与价格 | 瞳瞳',
  });
}

export default async function PricingPage(): Promise<React.JSX.Element> {
  const plans = await getPublicBillingPlans();

  return (
    <section className="saas-pricing-page">
      <header className="saas-pricing-hero">
        <p className="saas-kicker">TONG / COLLABORATION</p>
        <h1>选择适合你的方案。</h1>
        <p>
          从基础协作空间开始；当项目、成员、存储和 AI
          使用量增长时，再按真实需求升级。所有价格由服务端套餐配置决定。
        </p>
        <Link className="saas-pricing-text-link" href="/contact">
          <span>需要企业方案或定制能力？</span>
          <ArrowRight aria-hidden="true" size={16} strokeWidth={1.75} />
        </Link>
      </header>
      <PricingPlanGrid plans={plans} />
      <p className="saas-pricing-disclaimer">
        不处理银行卡信息。实际支付由 Stripe Checkout 完成；企业版、私有部署与 SSO 需要先沟通确认。
      </p>
    </section>
  );
}
