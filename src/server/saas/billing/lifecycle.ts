import { OrganizationLifecycleStage, UserNotificationKind } from '@/generated/prisma/client';
import { requireCmsDatabase } from '@/server/cms/database';
import { BillingStateMappingError } from '@/server/saas/billing/billing-errors';

export const billingLifecycleEvents = [
  'signup',
  'trial_start',
  'subscription_created',
  'upgrade',
  'cancel',
] as const;

export type BillingLifecycleEvent = (typeof billingLifecycleEvents)[number];

type LifecycleRecordInput = Readonly<{
  readonly event: BillingLifecycleEvent;
  readonly organizationId: string;
  readonly stage: OrganizationLifecycleStage;
  readonly title: string;
  readonly userId?: string;
}>;

export async function recordBillingLifecycleEvent(input: LifecycleRecordInput): Promise<void> {
  const database = requireCmsDatabase();
  const [memberships, organization] = await Promise.all([
    database.membership.findMany({
      select: { userId: true },
      where: { organizationId: input.organizationId },
    }),
    database.organization.findUnique({
      select: { enterpriseId: true },
      where: { id: input.organizationId },
    }),
  ]);

  if (organization === null) {
    throw new BillingStateMappingError(input.organizationId);
  }

  const notification = getLifecycleNotification(input.event, input.title);

  await database.$transaction([
    database.organization.update({
      data: { lifecycleStage: input.stage },
      where: { id: input.organizationId },
    }),
    database.analyticsEvent.create({
      data: {
        event: input.event,
        metadata: { organizationId: input.organizationId },
        path: '/dashboard/settings/billing',
      },
    }),
    database.auditLog.create({
      data: {
        action: `billing.lifecycle.${input.event}`,
        enterpriseId: organization.enterpriseId,
        organizationId: input.organizationId,
        resource: 'subscription',
        ...(input.userId === undefined ? {} : { userId: input.userId }),
      },
    }),
    ...(memberships.length === 0
      ? []
      : [
          database.notification.createMany({
            data: memberships.map((membership) => ({
              content: notification.content,
              kind: notification.kind,
              title: notification.title,
              userId: membership.userId,
            })),
          }),
        ]),
  ]);
}

function getLifecycleNotification(
  event: BillingLifecycleEvent,
  title: string,
): Readonly<{
  readonly content: string;
  readonly kind: UserNotificationKind;
  readonly title: string;
}> {
  switch (event) {
    case 'cancel':
      return {
        content: '当前套餐会在本计费周期结束后停止续费，期间数据会保留。',
        kind: UserNotificationKind.SUBSCRIPTION_CANCELLED,
        title,
      };
    case 'trial_start':
      return {
        content: '试用已开始。可在账单页查看套餐能力与剩余额度。',
        kind: UserNotificationKind.TRIAL_ENDING,
        title,
      };
    case 'signup':
    case 'subscription_created':
    case 'upgrade':
      return {
        content: '套餐与企业空间已更新，可在账单页查看使用量和到期时间。',
        kind: UserNotificationKind.BILLING_UPDATED,
        title,
      };
    default:
      return assertNever(event);
  }
}

function assertNever(value: never): never {
  throw new BillingStateMappingError(String(value));
}
