'use server';

import { KnowledgeSyncStatus } from '@/generated/prisma/client';
import { recordAdminActivity } from '@/server/cms/activity';
import { parseAdminKnowledgeForm } from '@/server/cms/validation';

import {
  getAdminActionContext,
  getAdminResourceId,
  redirectToAdminResource,
  refreshAdminResource,
} from './action-utils';

export async function createAdminKnowledge(formData: FormData): Promise<void> {
  const parsed = parseAdminKnowledgeForm(formData);

  if (parsed.kind === 'invalid') {
    redirectToAdminResource('/admin/knowledge', 'error');
  }

  const { database } = await getAdminActionContext();
  const knowledge = await database.knowledge.create({
    data: {
      ...parsed.value,
      syncStatus: KnowledgeSyncStatus.PENDING,
    },
  });

  await recordAdminActivity({
    action: 'create',
    resource: 'knowledge',
    resourceId: knowledge.id,
    summary: `创建 AI 知识「${knowledge.title}」`,
  });
  refreshAdminResource('/admin/knowledge');
  redirectToAdminResource('/admin/knowledge', 'success');
}

export async function updateAdminKnowledge(formData: FormData): Promise<void> {
  const id = getAdminResourceId(formData);
  const parsed = parseAdminKnowledgeForm(formData);

  if (id === undefined || parsed.kind === 'invalid') {
    redirectToAdminResource('/admin/knowledge', 'error');
  }

  const { database } = await getAdminActionContext();
  const knowledge = await database.knowledge.update({
    data: {
      ...parsed.value,
      syncStatus: KnowledgeSyncStatus.PENDING,
    },
    where: { id },
  });

  await recordAdminActivity({
    action: 'update',
    resource: 'knowledge',
    resourceId: knowledge.id,
    summary: `更新 AI 知识「${knowledge.title}」`,
  });
  refreshAdminResource('/admin/knowledge');
  redirectToAdminResource('/admin/knowledge', 'success');
}

export async function deleteAdminKnowledge(formData: FormData): Promise<void> {
  const id = getAdminResourceId(formData);

  if (id === undefined) {
    redirectToAdminResource('/admin/knowledge', 'error');
  }

  const { database } = await getAdminActionContext();
  await database.knowledge.delete({ where: { id } });
  await recordAdminActivity({
    action: 'delete',
    resource: 'knowledge',
    resourceId: id,
    summary: '删除一条 AI 知识',
  });
  refreshAdminResource('/admin/knowledge');
  redirectToAdminResource('/admin/knowledge', 'success');
}
