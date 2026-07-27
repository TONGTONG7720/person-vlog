'use server';

import { MessageStatus } from '@/generated/prisma/client';
import { recordAdminActivity } from '@/server/cms/activity';
import { parseAdminMessageStatus } from '@/server/cms/validation';

import {
  getAdminActionContext,
  getAdminResourceId,
  redirectToAdminResource,
  refreshAdminResource,
} from './action-utils';

const messageStatusByFormValue = {
  archived: MessageStatus.ARCHIVED,
  completed: MessageStatus.COMPLETED,
  processing: MessageStatus.PROCESSING,
  unread: MessageStatus.UNREAD,
} as const;

export async function updateAdminMessageStatus(formData: FormData): Promise<void> {
  const id = getAdminResourceId(formData);
  const status = parseAdminMessageStatus(String(formData.get('status') ?? ''));

  if (id === undefined || status === undefined) {
    redirectToAdminResource('/admin/messages', 'error');
  }

  const { database } = await getAdminActionContext();
  await database.message.update({
    data: { status: messageStatusByFormValue[status] },
    where: { id },
  });
  await recordAdminActivity({
    action: 'update',
    resource: 'message',
    resourceId: id,
    summary: '更新咨询处理状态',
  });
  refreshAdminResource('/admin/messages');
  redirectToAdminResource('/admin/messages', 'success');
}

export async function deleteAdminMessage(formData: FormData): Promise<void> {
  const id = getAdminResourceId(formData);

  if (id === undefined) {
    redirectToAdminResource('/admin/messages', 'error');
  }

  const { database } = await getAdminActionContext();
  await database.message.delete({ where: { id } });
  await recordAdminActivity({
    action: 'delete',
    resource: 'message',
    resourceId: id,
    summary: '删除一条咨询记录',
  });
  refreshAdminResource('/admin/messages');
  redirectToAdminResource('/admin/messages', 'success');
}
