'use server';

import { revalidatePath } from 'next/cache';

import { recordAdminActivity } from '@/server/cms/activity';
import { parseAdminContentPlanForm, parseAdminKeywordForm } from '@/server/cms/validation';

import {
  getAdminActionContext,
  getAdminResourceId,
  redirectToAdminResource,
  refreshAdminResource,
} from './action-utils';

const contentPlanPath = '/admin/content-plan';

export async function createAdminContentPlan(formData: FormData): Promise<void> {
  const parsed = parseAdminContentPlanForm(formData);

  if (parsed.kind === 'invalid') {
    redirectToAdminResource(contentPlanPath, 'error');
  }

  const { database } = await getAdminActionContext();
  const plan = await database.contentPlan.create({
    data: {
      category: parsed.value.category,
      keyword: parsed.value.keyword,
      locale: parsed.value.locale,
      notes: parsed.value.notes === '' ? null : parsed.value.notes,
      priority: parsed.value.priority,
      publishDate: parsed.value.publishDate,
      status: parsed.value.status,
      title: parsed.value.title,
    },
  });

  await recordAdminActivity({
    action: 'create',
    resource: 'content-plan',
    resourceId: plan.id,
    summary: `新增内容选题「${plan.title}」`,
  });
  refreshContentGrowthResources();
  redirectToAdminResource(contentPlanPath, 'success');
}

export async function updateAdminContentPlan(formData: FormData): Promise<void> {
  const id = getAdminResourceId(formData);
  const parsed = parseAdminContentPlanForm(formData);

  if (id === undefined || parsed.kind === 'invalid') {
    redirectToAdminResource(contentPlanPath, 'error');
  }

  const { database } = await getAdminActionContext();
  const plan = await database.contentPlan.update({
    data: {
      category: parsed.value.category,
      keyword: parsed.value.keyword,
      locale: parsed.value.locale,
      notes: parsed.value.notes === '' ? null : parsed.value.notes,
      priority: parsed.value.priority,
      publishDate: parsed.value.publishDate,
      status: parsed.value.status,
      title: parsed.value.title,
    },
    where: { id },
  });

  await recordAdminActivity({
    action: 'update',
    resource: 'content-plan',
    resourceId: plan.id,
    summary: `更新内容选题「${plan.title}」`,
  });
  refreshContentGrowthResources();
  redirectToAdminResource(contentPlanPath, 'success');
}

export async function deleteAdminContentPlan(formData: FormData): Promise<void> {
  const id = getAdminResourceId(formData);

  if (id === undefined) {
    redirectToAdminResource(contentPlanPath, 'error');
  }

  const { database } = await getAdminActionContext();
  await database.contentPlan.delete({ where: { id } });
  await recordAdminActivity({
    action: 'delete',
    resource: 'content-plan',
    resourceId: id,
    summary: '删除一个内容选题',
  });
  refreshContentGrowthResources();
  redirectToAdminResource(contentPlanPath, 'success');
}

export async function createAdminKeyword(formData: FormData): Promise<void> {
  const parsed = parseAdminKeywordForm(formData);

  if (parsed.kind === 'invalid') {
    redirectToAdminResource(contentPlanPath, 'error');
  }

  const { database } = await getAdminActionContext();
  const keyword = await database.keyword.create({
    data: {
      category: parsed.value.category,
      difficulty: parsed.value.difficulty === '' ? null : parsed.value.difficulty,
      keyword: parsed.value.keyword,
      volume: parsed.value.volume === '' ? null : parsed.value.volume,
    },
  });

  await recordAdminActivity({
    action: 'create',
    resource: 'keyword',
    resourceId: keyword.id,
    summary: `新增关键词「${keyword.keyword}」`,
  });
  refreshContentGrowthResources();
  redirectToAdminResource(contentPlanPath, 'success');
}

export async function deleteAdminKeyword(formData: FormData): Promise<void> {
  const id = getAdminResourceId(formData);

  if (id === undefined) {
    redirectToAdminResource(contentPlanPath, 'error');
  }

  const { database } = await getAdminActionContext();
  await database.keyword.delete({ where: { id } });
  await recordAdminActivity({
    action: 'delete',
    resource: 'keyword',
    resourceId: id,
    summary: '删除一个关键词',
  });
  refreshContentGrowthResources();
  redirectToAdminResource(contentPlanPath, 'success');
}

function refreshContentGrowthResources(): void {
  refreshAdminResource(contentPlanPath);
  revalidatePath('/admin/growth');
  revalidatePath('/blog');
  revalidatePath('/rss.xml');
  revalidatePath('/sitemap.xml');
}
