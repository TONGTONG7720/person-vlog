import { BillingCycle } from '@/generated/prisma/client';
import { requireCmsDatabase } from '@/server/cms/database';
import { requireSaasPermission, type SaasContext } from '@/server/saas/auth';
import {
  BillingConfigurationError,
  BillingPlanUnavailableError,
  BillingSubscriptionChangeUnavailableError,
} from '@/server/saas/billing/billing-errors';
import { canStartStripeCheckout } from '@/server/saas/billing/checkout-policy';
import { requireStripeClient } from '@/server/saas/billing/stripe-client';
import { saasPermissions } from '@/server/saas/rbac';

type CreateStripeCheckoutInput = Readonly<{
  readonly context: SaasContext;
  readonly origin: string;
  readonly planSlug: string;
}>;

export async function createStripeCheckoutSession(
  input: CreateStripeCheckoutInput,
): Promise<Readonly<{ readonly url: string }>> {
  requireSaasPermission(input.context, saasPermissions.billingManage);
  const database = requireCmsDatabase();
  const plan = await database.plan.findFirst({
    where: { active: true, slug: input.planSlug },
  });

  if (plan === null || plan.priceCents <= 0) {
    throw new BillingPlanUnavailableError();
  }

  const subscription = await database.subscription.findUnique({
    select: {
      id: true,
      provider: true,
      providerCustomerId: true,
      providerSubscriptionId: true,
      status: true,
    },
    where: { organizationId: input.context.organization.id },
  });

  if (subscription === null) {
    throw new BillingConfigurationError();
  }

  if (!canStartStripeCheckout(subscription)) {
    throw new BillingSubscriptionChangeUnavailableError();
  }

  const stripe = requireStripeClient();
  const billingUrl = new URL('/dashboard/settings/billing', input.origin);
  billingUrl.searchParams.set('organization', input.context.organization.slug);
  const successUrl = new URL(billingUrl);
  successUrl.searchParams.set('checkout', 'success');
  const cancelUrl = new URL(billingUrl);
  cancelUrl.searchParams.set('checkout', 'cancelled');
  const metadata = {
    organizationId: input.context.organization.id,
    planId: plan.id,
    subscriptionId: subscription.id,
  };
  const session = await stripe.checkout.sessions.create({
    ...(subscription.providerCustomerId === null
      ? { customer_email: input.context.user.email }
      : { customer: subscription.providerCustomerId }),
    cancel_url: cancelUrl.toString(),
    client_reference_id: input.context.organization.id,
    line_items: [
      {
        price_data: {
          currency: plan.currency.toLocaleLowerCase('en-US'),
          product_data: { description: plan.description, name: plan.name },
          recurring: {
            interval: plan.billingCycle === BillingCycle.YEARLY ? 'year' : 'month',
          },
          unit_amount: plan.priceCents,
        },
        quantity: 1,
      },
    ],
    metadata,
    mode: 'subscription',
    subscription_data: { metadata },
    success_url: successUrl.toString(),
  });

  if (session.url === null) {
    throw new BillingConfigurationError();
  }

  await database.auditLog.create({
    data: {
      action: 'billing.checkout.created',
      enterpriseId: input.context.enterprise.id,
      organizationId: input.context.organization.id,
      resource: 'checkout_session',
      resourceId: session.id,
      userId: input.context.user.id,
    },
  });

  return { url: session.url };
}

export async function scheduleStripeSubscriptionCancellation(context: SaasContext): Promise<void> {
  requireSaasPermission(context, saasPermissions.billingManage);
  const database = requireCmsDatabase();
  const subscription = await database.subscription.findUnique({
    select: { id: true, provider: true, providerSubscriptionId: true },
    where: { organizationId: context.organization.id },
  });

  if (
    subscription === null ||
    subscription.provider !== 'stripe' ||
    subscription.providerSubscriptionId === null
  ) {
    throw new BillingConfigurationError();
  }

  await requireStripeClient().subscriptions.update(subscription.providerSubscriptionId, {
    cancel_at_period_end: true,
  });
  await database.subscription.update({
    data: { cancelAtPeriodEnd: true },
    where: { id: subscription.id },
  });
  await database.auditLog.create({
    data: {
      action: 'billing.cancellation.scheduled',
      enterpriseId: context.enterprise.id,
      organizationId: context.organization.id,
      resource: 'subscription',
      resourceId: subscription.id,
      userId: context.user.id,
    },
  });
}
