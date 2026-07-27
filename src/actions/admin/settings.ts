'use server';

import { recordAdminActivity } from '@/server/cms/activity';
import { parseAdminSettingForm } from '@/server/cms/validation';

import {
  getAdminActionContext,
  getAdminResourceId,
  redirectToAdminResource,
  refreshAdminResource,
} from './action-utils';

export async function upsertAdminSetting(formData: FormData): Promise<void> {
  const parsed = parseAdminSettingForm(formData);

  if (parsed.kind === 'invalid') {
    redirectToAdminResource('/admin/settings', 'error');
  }

  const { database } = await getAdminActionContext();
  const setting = await database.siteSetting.upsert({
    create: parsed.value,
    update: { value: parsed.value.value },
    where: { key: parsed.value.key },
  });

  await recordAdminActivity({
    action: 'update',
    resource: 'setting',
    resourceId: setting.id,
    summary: `更新设置「${setting.key}」`,
  });
  refreshAdminResource('/admin/settings');
  redirectToAdminResource('/admin/settings', 'success');
}

export async function deleteAdminSetting(formData: FormData): Promise<void> {
  const id = getAdminResourceId(formData);

  if (id === undefined) {
    redirectToAdminResource('/admin/settings', 'error');
  }

  const { database } = await getAdminActionContext();
  await database.siteSetting.delete({ where: { id } });
  await recordAdminActivity({
    action: 'delete',
    resource: 'setting',
    resourceId: id,
    summary: '删除一个站点设置',
  });
  refreshAdminResource('/admin/settings');
  redirectToAdminResource('/admin/settings', 'success');
}
