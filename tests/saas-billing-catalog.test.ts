import { describe, expect, it } from 'vitest';

import { saasPlanDefinitions } from '../src/server/saas/defaults';

describe('SaaS 商业套餐目录', () => {
  it('为 Free 套餐定义零价格、试用入口与明确的产品限制', () => {
    // Given
    const freePlan = saasPlanDefinitions.find((plan) => plan.key === 'free');

    // When
    const limits = freePlan?.limits;

    // Then
    expect(freePlan).toMatchObject({
      billingCycle: 'MONTHLY',
      currency: 'CNY',
      priceCents: 0,
      trialDays: 7,
    });
    expect(limits).toMatchObject({ aiMessages: 100, members: 1, projects: 2, workspaces: 1 });
  });

  it('为 Pro 套餐以最小货币单位定义月付价格与更高的 AI 限额', () => {
    // Given
    const proPlan = saasPlanDefinitions.find((plan) => plan.key === 'pro');

    // When
    const limits = proPlan?.limits;

    // Then
    expect(proPlan).toMatchObject({
      billingCycle: 'MONTHLY',
      currency: 'CNY',
      priceCents: 9900,
      trialDays: 7,
    });
    expect(limits).toMatchObject({ aiMessages: 1000, members: 3, projects: 10, workspaces: 3 });
  });
});
