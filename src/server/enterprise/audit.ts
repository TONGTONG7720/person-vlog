import { createHash } from 'node:crypto';

import { requireCmsDatabase } from '@/server/cms/database';
import {
  getEnterpriseAdminNotificationEventForAuditAction,
  notifyEnterpriseAdministrators,
} from '@/server/enterprise/notifications';

export type EnterpriseAuditInput = Readonly<{
  readonly action: string;
  readonly enterpriseId: string;
  readonly ipAddress?: string;
  readonly metadata?: object;
  readonly organizationId: string;
  readonly resource: string;
  readonly resourceId?: string;
  readonly userId?: string;
}>;

export async function writeEnterpriseAuditLog(input: EnterpriseAuditInput): Promise<void> {
  const database = requireCmsDatabase();

  await database.auditLog.create({
    data: {
      action: input.action,
      enterpriseId: input.enterpriseId,
      ...(input.ipAddress === undefined ? {} : { ipHash: hashEnterpriseIp(input.ipAddress) }),
      ...(input.metadata === undefined ? {} : { metadata: input.metadata }),
      organizationId: input.organizationId,
      resource: input.resource,
      ...(input.resourceId === undefined ? {} : { resourceId: input.resourceId }),
      ...(input.userId === undefined ? {} : { userId: input.userId }),
    },
  });

  const notificationEvent = getEnterpriseAdminNotificationEventForAuditAction(input.action);

  if (notificationEvent !== undefined) {
    await notifyEnterpriseAdministrators({
      enterpriseId: input.enterpriseId,
      event: notificationEvent,
    });
  }
}

export function hashEnterpriseIp(value: string): string {
  return createHash('sha256').update(value).digest('hex').slice(0, 24);
}
