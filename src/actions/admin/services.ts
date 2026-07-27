'use server';

import { recordAdminActivity } from '@/server/cms/activity';
import { parseAdminServiceForm } from '@/server/cms/validation';

import {
  getAdminActionContext,
  getAdminResourceId,
  redirectToAdminResource,
  refreshAdminResource,
} from './action-utils';

export async function createAdminService(formData: FormData): Promise<void> {
  const parsed = parseAdminServiceForm(formData);

  if (parsed.kind === 'invalid') {
    redirectToAdminResource('/admin/services', 'error');
  }

  const { database } = await getAdminActionContext();
  const service = await database.service.create({
    data: {
      ...parsed.value,
      content: parsed.value.content === '' ? null : parsed.value.content,
      translationGroup: parsed.value.translationGroup === '' ? null : parsed.value.translationGroup,
    },
  });

  await recordAdminActivity({
    action: 'create',
    resource: 'service',
    resourceId: service.id,
    summary: `创建服务「${service.title}」`,
  });
  refreshAdminResource('/admin/services');
  refreshAdminResource('/services');
  redirectToAdminResource('/admin/services', 'success');
}

export async function updateAdminService(formData: FormData): Promise<void> {
  const id = getAdminResourceId(formData);
  const parsed = parseAdminServiceForm(formData);

  if (id === undefined || parsed.kind === 'invalid') {
    redirectToAdminResource('/admin/services', 'error');
  }

  const { database } = await getAdminActionContext();
  const service = await database.service.update({
    data: {
      ...parsed.value,
      content: parsed.value.content === '' ? null : parsed.value.content,
      translationGroup: parsed.value.translationGroup === '' ? null : parsed.value.translationGroup,
    },
    where: { id },
  });

  await recordAdminActivity({
    action: 'update',
    resource: 'service',
    resourceId: service.id,
    summary: `更新服务「${service.title}」`,
  });
  refreshAdminResource('/admin/services');
  refreshAdminResource('/services');
  redirectToAdminResource('/admin/services', 'success');
}

export async function deleteAdminService(formData: FormData): Promise<void> {
  const id = getAdminResourceId(formData);

  if (id === undefined) {
    redirectToAdminResource('/admin/services', 'error');
  }

  const { database } = await getAdminActionContext();
  await database.service.delete({ where: { id } });
  await recordAdminActivity({
    action: 'delete',
    resource: 'service',
    resourceId: id,
    summary: '删除一个服务条目',
  });
  refreshAdminResource('/admin/services');
  refreshAdminResource('/services');
  redirectToAdminResource('/admin/services', 'success');
}
