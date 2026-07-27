import Stripe from 'stripe';

import { BillingConfigurationError } from '@/server/saas/billing/billing-errors';

type StripeConfiguration = Readonly<{
  readonly secretKey: string;
  readonly webhookSecret: string | undefined;
}>;

export function isStripeBillingConfigured(): boolean {
  return getStripeConfiguration() !== undefined;
}

export function requireStripeClient(): Stripe {
  const configuration = getStripeConfiguration();

  if (configuration === undefined) {
    throw new BillingConfigurationError();
  }

  return new Stripe(configuration.secretKey);
}

export function constructStripeWebhookEvent(payload: string, signature: string): Stripe.Event {
  const configuration = getStripeConfiguration();

  if (configuration === undefined || configuration.webhookSecret === undefined) {
    throw new BillingConfigurationError();
  }

  return requireStripeClient().webhooks.constructEvent(
    payload,
    signature,
    configuration.webhookSecret,
  );
}

function getStripeConfiguration(): StripeConfiguration | undefined {
  const secretKey = process.env['STRIPE_SECRET_KEY']?.trim();

  if (secretKey === undefined || secretKey === '') {
    return undefined;
  }

  const webhookSecret = process.env['STRIPE_WEBHOOK_SECRET']?.trim();

  return { secretKey, webhookSecret: webhookSecret === '' ? undefined : webhookSecret };
}
