'use server';

import { recordAdminActivity } from '@/server/cms/activity';
import { moderateMarketplaceItem } from '@/server/marketplace/admin';
import { marketplaceModerationRequestSchema } from '@/server/marketplace/validation';

import {
  getAdminActionContext,
  getAdminResourceId,
  redirectToAdminResource,
  refreshAdminResource,
} from './action-utils';

export async function moderateAdminMarketplaceItem(formData: FormData): Promise<void> {
  const itemId = getAdminResourceId(formData);
  const parsed = marketplaceModerationRequestSchema.safeParse({
    reason: normalizeFormText(formData.get('reason')),
    status: formData.get('status'),
  });

  if (itemId === undefined || !parsed.success) {
    redirectToAdminResource('/admin/marketplace', 'error');
  }

  const { session } = await getAdminActionContext();
  const item = await moderateMarketplaceItem({
    itemId,
    reason: parsed.data.reason,
    reviewerEmail: session.email,
    status: parsed.data.status,
  });

  if (item === undefined) {
    redirectToAdminResource('/admin/marketplace', 'error');
  }

  await recordAdminActivity({
    action: 'moderate',
    resource: 'marketplace-item',
    resourceId: item.id,
    summary: `人工审核 Marketplace 发布「${item.title}」为 ${item.status}`,
  });
  refreshAdminResource('/admin/marketplace');
  refreshAdminResource('/marketplace');
  redirectToAdminResource('/admin/marketplace', 'success');
}

function normalizeFormText(value: FormDataEntryValue | null): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }

  const normalized = value.trim();

  return normalized === '' ? undefined : normalized;
}
