import { SubscriptionStatus } from '@/generated/prisma/client';

type StripeCheckoutWebhookEvent = Readonly<{
  readonly metadata: Readonly<Record<string, string | undefined>>;
  readonly providerEventId: string;
  readonly type: 'checkout.session.completed';
}>;

type StripeOtherWebhookEvent = Readonly<{
  readonly metadata: Readonly<Record<string, string | undefined>>;
  readonly providerEventId: string;
  readonly type: string;
}>;

export type StripeWebhookAction =
  | Readonly<{
      readonly kind: 'checkout-completed';
      readonly organizationId: string;
      readonly planId: string;
      readonly providerEventId: string;
    }>
  | Readonly<{ readonly kind: 'ignored'; readonly providerEventId: string }>;

export function mapStripeSubscriptionStatus(value: string): SubscriptionStatus {
  switch (value) {
    case 'active':
      return SubscriptionStatus.ACTIVE;
    case 'canceled':
      return SubscriptionStatus.CANCELLED;
    case 'incomplete':
    case 'past_due':
    case 'unpaid':
      return SubscriptionStatus.PAST_DUE;
    case 'trialing':
      return SubscriptionStatus.TRIALING;
    case 'incomplete_expired':
    default:
      return SubscriptionStatus.EXPIRED;
  }
}

export function resolveStripeWebhookAction(
  event: StripeCheckoutWebhookEvent | StripeOtherWebhookEvent,
): StripeWebhookAction {
  if (event.type !== 'checkout.session.completed') {
    return { kind: 'ignored', providerEventId: event.providerEventId };
  }

  const organizationId = event.metadata['organizationId'];
  const planId = event.metadata['planId'];

  if (organizationId === undefined || planId === undefined) {
    return { kind: 'ignored', providerEventId: event.providerEventId };
  }

  return {
    kind: 'checkout-completed',
    organizationId,
    planId,
    providerEventId: event.providerEventId,
  };
}
