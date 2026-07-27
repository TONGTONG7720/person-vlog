'use server';

import { del, put } from '@vercel/blob';

import { recordAdminActivity } from '@/server/cms/activity';
import { isAcceptedCmsImage, isCmsStorageConfigured } from '@/server/cms/storage';

import {
  getAdminActionContext,
  getAdminResourceId,
  redirectToAdminResource,
  refreshAdminResource,
} from './action-utils';

export async function uploadAdminMedia(formData: FormData): Promise<void> {
  const file = formData.get('file');

  if (!(file instanceof File) || !isCmsStorageConfigured() || !isAcceptedCmsImage(file)) {
    redirectToAdminResource('/admin/media', 'error');
  }

  const { database } = await getAdminActionContext();
  const blob = await put(`cms/${file.name}`, file, {
    access: 'public',
    addRandomSuffix: true,
  });
  const asset = await database.mediaAsset.create({
    data: {
      contentType: file.type,
      pathname: blob.pathname,
      size: file.size,
      url: blob.url,
    },
  });

  await recordAdminActivity({
    action: 'upload',
    resource: 'media',
    resourceId: asset.id,
    summary: `上传图片「${file.name}」`,
  });
  refreshAdminResource('/admin/media');
  redirectToAdminResource('/admin/media', 'success');
}

export async function deleteAdminMedia(formData: FormData): Promise<void> {
  const id = getAdminResourceId(formData);

  if (id === undefined || !isCmsStorageConfigured()) {
    redirectToAdminResource('/admin/media', 'error');
  }

  const { database } = await getAdminActionContext();
  const asset = await database.mediaAsset.findUnique({ where: { id } });

  if (asset === null) {
    redirectToAdminResource('/admin/media', 'error');
  }

  await del(asset.url);
  await database.mediaAsset.delete({ where: { id } });
  await recordAdminActivity({
    action: 'delete',
    resource: 'media',
    resourceId: id,
    summary: `删除图片「${asset.pathname}」`,
  });
  refreshAdminResource('/admin/media');
  redirectToAdminResource('/admin/media', 'success');
}
