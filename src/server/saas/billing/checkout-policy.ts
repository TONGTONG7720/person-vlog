import { SubscriptionStatus } from '@/generated/prisma/client';

type StripeCheckoutSubscription = Readonly<{
  readonly provider: string | null;
  readonly providerSubscriptionId: string | null;
  readonly status: SubscriptionStatus;
}>;

export function canStartStripeCheckout(subscription: StripeCheckoutSubscription): boolean {
  if (subscription.provider !== 'stripe' || subscription.providerSubscriptionId === null) {
    return true;
  }

  switch (subscription.status) {
    case SubscriptionStatus.ACTIVE:
    case SubscriptionStatus.PAST_DUE:
    case SubscriptionStatus.TRIALING:
      return false;
    case SubscriptionStatus.CANCELLED:
    case SubscriptionStatus.EXPIRED:
      return true;
    default:
      return assertNever(subscription.status);
  }
}

function assertNever(value: never): never {
  throw new StripeCheckoutPolicyError(String(value));
}

class StripeCheckoutPolicyError extends Error {
  public constructor(public readonly value: string) {
    super(`Cannot evaluate Stripe Checkout eligibility for state: ${value}`);
    this.name = 'StripeCheckoutPolicyError';
  }
}
