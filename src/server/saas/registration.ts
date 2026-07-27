import { randomUUID } from 'node:crypto';

import { hash } from 'bcryptjs';

import {
  OrganizationLifecycleStage,
  SubscriptionStatus,
  UserNotificationKind,
} from '@/generated/prisma/client';
import { getCmsDatabase } from '@/server/cms/database';
import { createOrganizationSlug, ensureSaasDefaults } from '@/server/saas/defaults';
import { registerSaasAccountSchema, type RegisterSaasAccountInput } from '@/server/saas/validation';

type RegistrationResult =
  | Readonly<{ readonly kind: 'configuration-unavailable' }>
  | Readonly<{ readonly kind: 'email-taken' }>
  | Readonly<{ readonly kind: 'invalid' }>
  | Readonly<{
      readonly kind: 'created';
      readonly organizationSlug: string;
      readonly userId: string;
    }>;

export async function registerSaasAccount(input: unknown): Promise<RegistrationResult> {
  const parsed = registerSaasAccountSchema.safeParse(input);

  if (!parsed.success) {
    return { kind: 'invalid' };
  }

  const database = getCmsDatabase();

  if (database === undefined) {
    return { kind: 'configuration-unavailable' };
  }

  const email = parsed.data.email.toLocaleLowerCase('en-US');
  const existingUser = await database.user.findUnique({ where: { email }, select: { id: true } });

  if (existingUser !== null) {
    return { kind: 'email-taken' };
  }

  await ensureSaasDefaults(database);
  const organizationSlug = await resolveOrganizationSlug(parsed.data, database);
  const [ownerRole, freePlan] = await Promise.all([
    database.role.findUnique({ where: { key: 'ENTERPRISE_OWNER' }, select: { id: true } }),
    database.plan.findUnique({ where: { key: 'free' }, select: { id: true, trialDays: true } }),
  ]);

  if (ownerRole === null || freePlan === null) {
    return { kind: 'configuration-unavailable' };
  }

  const passwordHash = await hash(parsed.data.password, 12);
  const subscriptionStartedAt = new Date();
  const trialEndsAt = new Date(
    subscriptionStartedAt.getTime() + freePlan.trialDays * 24 * 60 * 60 * 1_000,
  );
  const created = await database.$transaction(async (transaction) => {
    const user = await transaction.user.create({ data: { email, passwordHash } });
    const enterprise = await transaction.enterprise.create({
      data: { name: parsed.data.organizationName },
    });
    const organization = await transaction.organization.create({
      data: {
        enterpriseId: enterprise.id,
        lifecycleStage: OrganizationLifecycleStage.TRIAL,
        name: parsed.data.organizationName,
        slug: organizationSlug,
      },
    });
    const department = await transaction.department.create({
      data: {
        enterpriseId: enterprise.id,
        name: 'General',
        organizationId: organization.id,
      },
    });
    const membership = await transaction.membership.create({
      data: {
        departmentId: department.id,
        enterpriseId: enterprise.id,
        organizationId: organization.id,
        roleId: ownerRole.id,
        userId: user.id,
      },
    });

    await Promise.all([
      transaction.workspace.create({
        data: {
          departmentId: department.id,
          enterpriseId: enterprise.id,
          name: 'General',
          organizationId: organization.id,
          slug: 'general',
        },
      }),
      transaction.subscription.create({
        data: {
          currentPeriodEndsAt: trialEndsAt,
          currentPeriodStartsAt: subscriptionStartedAt,
          organizationId: organization.id,
          planId: freePlan.id,
          status: SubscriptionStatus.TRIALING,
          trialEndsAt,
        },
      }),
      transaction.auditLog.create({
        data: {
          action: 'organization.created',
          enterpriseId: enterprise.id,
          organizationId: organization.id,
          resource: 'organization',
          resourceId: organization.id,
          userId: membership.userId,
        },
      }),
      transaction.analyticsEvent.create({
        data: {
          event: 'signup',
          metadata: { organizationId: organization.id },
          path: '/signup',
        },
      }),
      transaction.analyticsEvent.create({
        data: {
          event: 'trial_start',
          metadata: { organizationId: organization.id },
          path: '/signup',
        },
      }),
      transaction.notification.create({
        data: {
          content: '你的试用已开始。可在账单页查看套餐能力、用量和到期时间。',
          kind: UserNotificationKind.BILLING_UPDATED,
          title: '欢迎使用协作空间',
          userId: user.id,
        },
      }),
    ]);

    return { userId: user.id };
  });

  return { kind: 'created', organizationSlug, userId: created.userId };
}

async function resolveOrganizationSlug(
  input: RegisterSaasAccountInput,
  database: NonNullable<ReturnType<typeof getCmsDatabase>>,
): Promise<string> {
  const baseSlug = createOrganizationSlug(input.organizationName);
  const existingOrganization = await database.organization.findUnique({
    select: { id: true },
    where: { slug: baseSlug },
  });

  return existingOrganization === null ? baseSlug : `${baseSlug}-${randomUUID().slice(0, 8)}`;
}
