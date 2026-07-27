import { describe, expect, it } from 'vitest';

import { formatBillingPrice, formatBillingUsageLimit } from '../src/lib/billing-presentation';

describe('账单展示格式', () => {
  it('为公开套餐区分免费、按月价格与企业定制入口', () => {
    // Given
    const freePlan = { currency: 'CNY', priceCents: 0, slug: 'free' };
    const proPlan = { currency: 'CNY', priceCents: 9900, slug: 'pro' };
    const enterprisePlan = { currency: 'CNY', priceCents: 0, slug: 'enterprise' };

    // When
    const prices = [
      formatBillingPrice(freePlan),
      formatBillingPrice(proPlan),
      formatBillingPrice(enterprisePlan),
    ];

    // Then
    expect(prices).toEqual(['免费', '¥99', '联系定制']);
  });

  it('把存储和 AI 用量限制转换为明确的中文单位', () => {
    // Given
    const storageBytes = 10 * 1024 * 1024 * 1024;

    // When
    const limits = [
      formatBillingUsageLimit('storageBytes', storageBytes),
      formatBillingUsageLimit('aiMessages', 1000),
      formatBillingUsageLimit('members', null),
    ];

    // Then
    expect(limits).toEqual(['10 GB', '1,000 次 / 月', '不限成员']);
  });
});
