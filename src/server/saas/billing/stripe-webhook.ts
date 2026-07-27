import type Stripe from 'stripe';

import {
  InvoiceStatus,
  OrganizationLifecycleStage,
  PaymentStatus,
  Prisma,
  SubscriptionStatus,
} from '@/generated/prisma/client';
import { requireCmsDatabase } from '@/server/cms/database';
import {
  BillingPlanUnavailableError,
  BillingStateMappingError,
} from '@/server/saas/billing/billing-errors';
import { recordBillingLifecycleEvent } from '@/server/saas/billing/lifecycle';
import {
  mapStripeSubscriptionStatus,
  resolveStripeWebhookAction,
} from '@/server/saas/billing/stripe-event-mapping';

export type StripeWebhookHandlingResult =
  | Readonly<{ readonly kind: 'duplicate' }>
  | Readonly<{ readonly kind: 'ignored' }>
  | Readonly<{ readonly kind: 'processed' }>;

export async function handleStripeWebhook(
  event: Stripe.Event,
): Promise<StripeWebhookHandlingResult> {
  const database = requireCmsDatabase();
  const existingEvent = await database.billingEvent.findUnique({
    select: { id: true },
    where: { providerEventId: event.id },
  });

  if (existingEvent !== null) {
    return { kind: 'duplicate' };
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        return await handleCheckoutCompleted(event);
      case 'invoice.paid':
        return await handleInvoicePaid(event);
      case 'customer.subscription.deleted':
        return await handleSubscriptionDeleted(event);
      case 'customer.subscription.updated':
        return await handleSubscriptionUpdated(event);
      default:
        await recordIgnoredStripeEvent(event);

        return { kind: 'ignored' };
    }
  } catch (error) {
    if (isDuplicateBillingEventError(error)) {
      return { kind: 'duplicate' };
    }

    throw error;
  }
}

async function handleCheckoutCompleted(event: Stripe.Event): Promise<StripeWebhookHandlingResult> {
  const database = requireCmsDatabase();
  const action = resolveStripeWebhookAction({
    metadata: getMetadata(event.data.object),
    providerEventId: event.id,
    type: event.type,
  });

  if (action.kind === 'ignored') {
    await recordIgnoredStripeEvent(event);

    return { kind: 'ignored' };
  }

  const [plan, existingSubscription] = await Promise.all([
    database.plan.findFirst({ where: { active: true, id: action.planId } }),
    database.subscription.findUnique({
      select: { plan: { select: { key: true } }, status: true },
      where: { organizationId: action.organizationId },
    }),
  ]);

  if (plan === null) {
    throw new BillingPlanUnavailableError();
  }

  const providerCustomerId = getReferenceId(event.data.object, 'customer');
  const providerSubscriptionId = getReferenceId(event.data.object, 'subscription');
  const amountCents = getNumberField(event.data.object, 'amount_total') ?? plan.priceCents;
  const currency = getStringField(event.data.object, 'currency') ?? plan.currency;
  await database.$transaction(async (transaction) => {
    await transaction.billingEvent.create({
      data: createBillingEventData(event, action.organizationId),
    });
    const updatedSubscription = await transaction.subscription.upsert({
      create: {
        ...(providerCustomerId === undefined ? {} : { providerCustomerId }),
        ...(providerSubscriptionId === undefined ? {} : { providerSubscriptionId }),
        currentPeriodEndsAt: null,
        currentPeriodStartsAt: new Date(),
        organizationId: action.organizationId,
        planId: plan.id,
        provider: 'stripe',
        status: SubscriptionStatus.ACTIVE,
        trialEndsAt: null,
      },
      update: {
        ...(providerCustomerId === undefined ? {} : { providerCustomerId }),
        ...(providerSubscriptionId === undefined ? {} : { providerSubscriptionId }),
        cancelAtPeriodEnd: false,
        cancelledAt: null,
        currentPeriodEndsAt: null,
        currentPeriodStartsAt: new Date(),
        planId: plan.id,
        provider: 'stripe',
        status: SubscriptionStatus.ACTIVE,
        trialEndsAt: null,
      },
      where: { organizationId: action.organizationId },
    });
    await transaction.organization.update({
      data: { lifecycleStage: OrganizationLifecycleStage.CUSTOMER },
      where: { id: action.organizationId },
    });
    await transaction.payment.upsert({
      create: {
        amountCents,
        currency: currency.toLocaleUpperCase('en-US'),
        organizationId: action.organizationId,
        provider: 'stripe',
        providerId: event.id,
        status: PaymentStatus.SUCCEEDED,
        subscriptionId: updatedSubscription.id,
      },
      update: { status: PaymentStatus.SUCCEEDED },
      where: { providerId: event.id },
    });
  });

  await recordBillingLifecycleEvent({
    event: isFirstPaidSubscription(existingSubscription) ? 'subscription_created' : 'upgrade',
    organizationId: action.organizationId,
    stage: OrganizationLifecycleStage.CUSTOMER,
    title: `已启用 ${plan.name} 套餐`,
  });
  return { kind: 'processed' };
}

function isFirstPaidSubscription(
  subscription: Readonly<{
    readonly plan: Readonly<{ readonly key: string }>;
    readonly status: SubscriptionStatus;
  }> | null,
): boolean {
  return (
    subscription === null ||
    (subscription.plan.key === 'free' && subscription.status === SubscriptionStatus.TRIALING)
  );
}

async function handleInvoicePaid(event: Stripe.Event): Promise<StripeWebhookHandlingResult> {
  const database = requireCmsDatabase();
  const providerSubscriptionId = getInvoiceSubscriptionId(event.data.object);

  if (providerSubscriptionId === undefined) {
    await recordIgnoredStripeEvent(event);

    return { kind: 'ignored' };
  }

  const subscription = await database.subscription.findUnique({
    select: { id: true, organizationId: true },
    where: { providerSubscriptionId },
  });

  if (subscription === null) {
    await recordIgnoredStripeEvent(event);

    return { kind: 'ignored' };
  }

  const amountCents = getNumberField(event.data.object, 'amount_paid') ?? 0;
  const currency = (getStringField(event.data.object, 'currency') ?? 'CNY').toLocaleUpperCase(
    'en-US',
  );
  const invoiceId = getStringField(event.data.object, 'id') ?? event.id;
  const paymentId = getReferenceId(event.data.object, 'payment_intent') ?? event.id;

  await database.$transaction(async (transaction) => {
    await transaction.billingEvent.create({
      data: createBillingEventData(event, subscription.organizationId),
    });
    await transaction.subscription.update({
      data: { status: SubscriptionStatus.ACTIVE },
      where: { id: subscription.id },
    });
    await transaction.invoice.upsert({
      create: {
        amountCents,
        currency,
        issuedAt: new Date(),
        providerId: invoiceId,
        status: InvoiceStatus.PAID,
        subscriptionId: subscription.id,
      },
      update: { amountCents, currency, status: InvoiceStatus.PAID },
      where: { providerId: invoiceId },
    });
    await transaction.payment.upsert({
      create: {
        amountCents,
        currency,
        organizationId: subscription.organizationId,
        provider: 'stripe',
        providerId: paymentId,
        status: PaymentStatus.SUCCEEDED,
        subscriptionId: subscription.id,
      },
      update: { amountCents, currency, status: PaymentStatus.SUCCEEDED },
      where: { providerId: paymentId },
    });
  });

  return { kind: 'processed' };
}

async function handleSubscriptionUpdated(
  event: Stripe.Event,
): Promise<StripeWebhookHandlingResult> {
  const database = requireCmsDatabase();
  const providerSubscriptionId = getStringField(event.data.object, 'id');

  if (providerSubscriptionId === undefined) {
    await recordIgnoredStripeEvent(event);

    return { kind: 'ignored' };
  }

  const subscription = await database.subscription.findUnique({
    select: { id: true, organizationId: true },
    where: { providerSubscriptionId },
  });

  if (subscription === null) {
    await recordIgnoredStripeEvent(event);

    return { kind: 'ignored' };
  }

  const status = mapStripeSubscriptionStatus(getStringField(event.data.object, 'status') ?? '');
  const stage = getLifecycleStage(status);
  const providerCustomerId = getReferenceId(event.data.object, 'customer');
  const cancelledAt =
    status === SubscriptionStatus.CANCELLED || status === SubscriptionStatus.EXPIRED
      ? new Date()
      : null;

  await database.$transaction(async (transaction) => {
    await transaction.billingEvent.create({
      data: createBillingEventData(event, subscription.organizationId),
    });
    await transaction.subscription.update({
      data: {
        ...(providerCustomerId === undefined ? {} : { providerCustomerId }),
        cancelAtPeriodEnd: getBooleanField(event.data.object, 'cancel_at_period_end') ?? false,
        cancelledAt,
        currentPeriodEndsAt: getUnixDateField(event.data.object, 'current_period_end'),
        currentPeriodStartsAt: getUnixDateField(event.data.object, 'current_period_start'),
        status,
      },
      where: { id: subscription.id },
    });
    await transaction.organization.update({
      data: { lifecycleStage: stage },
      where: { id: subscription.organizationId },
    });
  });

  return { kind: 'processed' };
}

async function handleSubscriptionDeleted(
  event: Stripe.Event,
): Promise<StripeWebhookHandlingResult> {
  const database = requireCmsDatabase();
  const providerSubscriptionId = getStringField(event.data.object, 'id');

  if (providerSubscriptionId === undefined) {
    await recordIgnoredStripeEvent(event);

    return { kind: 'ignored' };
  }

  const subscription = await database.subscription.findUnique({
    select: { id: true, organizationId: true },
    where: { providerSubscriptionId },
  });

  if (subscription === null) {
    await recordIgnoredStripeEvent(event);

    return { kind: 'ignored' };
  }

  await database.$transaction(async (transaction) => {
    await transaction.billingEvent.create({
      data: createBillingEventData(event, subscription.organizationId),
    });
    await transaction.organization.update({
      data: { lifecycleStage: OrganizationLifecycleStage.INACTIVE },
      where: { id: subscription.organizationId },
    });
    await transaction.subscription.update({
      data: {
        cancelAtPeriodEnd: false,
        cancelledAt: new Date(),
        status: SubscriptionStatus.CANCELLED,
      },
      where: { id: subscription.id },
    });
  });
  await recordBillingLifecycleEvent({
    event: 'cancel',
    organizationId: subscription.organizationId,
    stage: OrganizationLifecycleStage.INACTIVE,
    title: '订阅已结束',
  });

  return { kind: 'processed' };
}

async function recordIgnoredStripeEvent(event: Stripe.Event): Promise<void> {
  const database = requireCmsDatabase();

  await database.billingEvent.create({ data: createBillingEventData(event) });
}

function createBillingEventData(event: Stripe.Event, organizationId?: string) {
  return {
    ...(organizationId === undefined ? {} : { organizationId }),
    payload: { eventId: event.id, type: event.type },
    provider: 'stripe',
    providerEventId: event.id,
    type: event.type,
  };
}

function getLifecycleStage(status: SubscriptionStatus): OrganizationLifecycleStage {
  switch (status) {
    case SubscriptionStatus.ACTIVE:
    case SubscriptionStatus.PAST_DUE:
      return OrganizationLifecycleStage.CUSTOMER;
    case SubscriptionStatus.CANCELLED:
    case SubscriptionStatus.EXPIRED:
      return OrganizationLifecycleStage.INACTIVE;
    case SubscriptionStatus.TRIALING:
      return OrganizationLifecycleStage.TRIAL;
    default:
      return assertNever(status);
  }
}

function getInvoiceSubscriptionId(value: unknown): string | undefined {
  const directSubscriptionId = getReferenceId(value, 'subscription');

  if (directSubscriptionId !== undefined) {
    return directSubscriptionId;
  }

  const parent = getRecordField(value, 'parent');
  const subscriptionDetails = getRecordField(parent, 'subscription_details');

  return getReferenceId(subscriptionDetails, 'subscription');
}

function getMetadata(value: unknown): Readonly<Record<string, string | undefined>> {
  const record = isRecord(value) ? value : {};
  const metadata = getRecordField(record, 'metadata');
  const result: Record<string, string | undefined> = {};

  if (!isRecord(metadata)) {
    return result;
  }

  for (const [key, metadataValue] of Object.entries(metadata)) {
    if (typeof metadataValue === 'string') {
      result[key] = metadataValue;
    }
  }

  return result;
}

function getReferenceId(value: unknown, key: string): string | undefined {
  const field = getRecordField(value, key);

  if (typeof field === 'string') {
    return field;
  }

  return getStringField(field, 'id');
}

function getStringField(value: unknown, key: string): string | undefined {
  const field = getRecordField(value, key);

  return typeof field === 'string' && field !== '' ? field : undefined;
}

function getNumberField(value: unknown, key: string): number | undefined {
  const field = getRecordField(value, key);

  return typeof field === 'number' && Number.isFinite(field) ? Math.trunc(field) : undefined;
}

function getBooleanField(value: unknown, key: string): boolean | undefined {
  const field = getRecordField(value, key);

  return typeof field === 'boolean' ? field : undefined;
}

function getUnixDateField(value: unknown, key: string): Date | null {
  const timestamp = getNumberField(value, key);

  return timestamp === undefined ? null : new Date(timestamp * 1_000);
}

function getRecordField(value: unknown, key: string): unknown {
  return isRecord(value) ? value[key] : undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isDuplicateBillingEventError(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002';
}

function assertNever(value: never): never {
  throw new BillingStateMappingError(String(value));
}
