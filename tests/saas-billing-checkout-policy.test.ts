import { SubscriptionStatus } from '@/generated/prisma/client';
import { describe, expect, it } from 'vitest';

import { canStartStripeCheckout } from '../src/server/saas/billing/checkout-policy';

describe('Stripe Checkout eligibility', () => {
  it('allows a Free or expired subscription to start a new Checkout session', () => {
    expect(
      canStartStripeCheckout({
        provider: null,
        providerSubscriptionId: null,
        status: SubscriptionStatus.TRIALING,
      }),
    ).toBe(true);
    expect(
      canStartStripeCheckout({
        provider: 'stripe',
        providerSubscriptionId: 'sub_ended',
        status: SubscriptionStatus.CANCELLED,
      }),
    ).toBe(true);
  });

  it('does not create a second Stripe subscription for an active paid organization', () => {
    expect(
      canStartStripeCheckout({
        provider: 'stripe',
        providerSubscriptionId: 'sub_active',
        status: SubscriptionStatus.ACTIVE,
      }),
    ).toBe(false);
  });
});
