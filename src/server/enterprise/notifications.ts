import { MembershipStatus, SaasRoleKey, UserNotificationKind } from '@/generated/prisma/client';
import { requireCmsDatabase } from '@/server/cms/database';

export const enterpriseAdminNotificationEvents = [
  'member.joined',
  'membership.role.changed',
  'security.event',
] as const;

export type EnterpriseAdminNotificationEvent = (typeof enterpriseAdminNotificationEvents)[number];

type EnterpriseAdminNotification = Readonly<{
  readonly content: string;
  readonly kind: UserNotificationKind;
  readonly title: string;
}>;

export function getEnterpriseAdminNotification(
  event: EnterpriseAdminNotificationEvent,
): EnterpriseAdminNotification {
  switch (event) {
    case 'member.joined':
      return {
        content: '企业空间有新成员加入，请确认部门与资源授权范围。',
        kind: UserNotificationKind.ENTERPRISE_MEMBER_JOINED,
        title: '新成员加入企业空间',
      };
    case 'membership.role.changed':
      return {
        content: '成员角色或部门权限已变更，请复核最小权限原则。',
        kind: UserNotificationKind.ENTERPRISE_ROLE_CHANGED,
        title: '成员权限已变更',
      };
    case 'security.event':
      return {
        content: '检测到需要关注的企业安全事件，请在安全中心查看详情。',
        kind: UserNotificationKind.ENTERPRISE_SECURITY_EVENT,
        title: '企业安全事件',
      };
  }
}

export function getEnterpriseAdminNotificationEventForAuditAction(
  action: string,
): EnterpriseAdminNotificationEvent | undefined {
  if (action === 'membership.joined') {
    return 'member.joined';
  }

  if (action === 'membership.role.changed') {
    return 'membership.role.changed';
  }

  if (
    action.startsWith('ai.document.') ||
    action.startsWith('ai.api_key.') ||
    action.startsWith('enterprise.domain.') ||
    action.startsWith('enterprise.security_policy.') ||
    action.startsWith('enterprise.sso.')
  ) {
    return 'security.event';
  }

  return undefined;
}

export async function notifyEnterpriseAdministrators(
  input: Readonly<{
    readonly enterpriseId: string;
    readonly event: EnterpriseAdminNotificationEvent;
  }>,
): Promise<void> {
  const database = requireCmsDatabase();
  const administrators = await database.membership.findMany({
    select: { userId: true },
    where: {
      enterpriseId: input.enterpriseId,
      role: { key: { in: [SaasRoleKey.ENTERPRISE_OWNER, SaasRoleKey.SECURITY_ADMIN] } },
      status: MembershipStatus.ACTIVE,
    },
  });
  const userIds = [...new Set(administrators.map((membership) => membership.userId))];

  if (userIds.length === 0) {
    return;
  }

  const notification = getEnterpriseAdminNotification(input.event);

  await database.notification.createMany({
    data: userIds.map((userId) => ({ ...notification, userId })),
  });
}
