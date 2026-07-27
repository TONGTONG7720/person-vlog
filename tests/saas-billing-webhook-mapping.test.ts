import { describe, expect, it } from 'vitest';

import {
  mapStripeSubscriptionStatus,
  resolveStripeWebhookAction,
} from '../src/server/saas/billing/stripe-event-mapping';

describe('Stripe 账单事件映射', () => {
  it('把已完成的 Checkout 映射为仅由已验证 Webhook 触发的订阅创建动作', () => {
    // Given
    const event = {
      metadata: { organizationId: 'organization-1', planId: 'plan-pro' },
      providerEventId: 'evt_checkout_1',
      type: 'checkout.session.completed',
    };

    // When
    const action = resolveStripeWebhookAction(event);

    // Then
    expect(action).toEqual({
      kind: 'checkout-completed',
      organizationId: 'organization-1',
      planId: 'plan-pro',
      providerEventId: 'evt_checkout_1',
    });
  });

  it('将 Stripe 的取消状态转换为内部订阅状态', () => {
    // Given
    const providerStatus = 'canceled';

    // When
    const status = mapStripeSubscriptionStatus(providerStatus);

    // Then
    expect(status).toBe('CANCELLED');
  });
});
