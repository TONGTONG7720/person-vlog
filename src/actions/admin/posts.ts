'use server';

import { Prisma } from '@/generated/prisma/client';
import { recordAdminActivity } from '@/server/cms/activity';
import { parseAdminPostForm } from '@/server/cms/validation';

import {
  getAdminActionContext,
  getAdminResourceId,
  redirectToAdminResource,
  refreshAdminResource,
} from './action-utils';

export async function createAdminPost(formData: FormData): Promise<void> {
  const parsed = parseAdminPostForm(formData);

  if (parsed.kind === 'invalid') {
    redirectToAdminResource('/admin/blog', 'error');
  }

  const { database } = await getAdminActionContext();
  const post = await database.post.create({
    data: {
      category: parsed.value.category,
      canonical: parsed.value.canonical === '' ? null : parsed.value.canonical,
      content: parsed.value.content,
      coverImage: parsed.value.coverImage === '' ? null : parsed.value.coverImage,
      description: parsed.value.description,
      keywords: parsed.value.keywords,
      locale: parsed.value.locale,
      ogImage: parsed.value.ogImage === '' ? null : parsed.value.ogImage,
      published: parsed.value.published,
      publishedAt: parsed.value.published ? new Date() : null,
      relatedPosts: parsed.value.relatedPosts,
      relatedProjects: parsed.value.relatedProjects,
      relatedServices: parsed.value.relatedServices,
      seoDescription: parsed.value.seoDescription,
      seoTitle: parsed.value.seoTitle,
      slug: parsed.value.slug,
      socialContent: getSocialContent(parsed.value.socialContent),
      tags: parsed.value.tags,
      title: parsed.value.title,
      translationGroup: parsed.value.translationGroup === '' ? null : parsed.value.translationGroup,
    },
  });

  await recordAdminActivity({
    action: post.published ? 'publish' : 'create',
    resource: 'post',
    resourceId: post.id,
    summary: `${post.published ? '发布' : '创建'}文章「${post.title}」`,
  });
  refreshAdminResource('/admin/blog');
  refreshAdminResource('/blog');
  redirectToAdminResource('/admin/blog', 'success');
}

export async function updateAdminPost(formData: FormData): Promise<void> {
  const id = getAdminResourceId(formData);
  const parsed = parseAdminPostForm(formData);

  if (id === undefined || parsed.kind === 'invalid') {
    redirectToAdminResource('/admin/blog', 'error');
  }

  const { database } = await getAdminActionContext();
  const post = await database.post.update({
    data: {
      category: parsed.value.category,
      canonical: parsed.value.canonical === '' ? null : parsed.value.canonical,
      content: parsed.value.content,
      coverImage: parsed.value.coverImage === '' ? null : parsed.value.coverImage,
      description: parsed.value.description,
      keywords: parsed.value.keywords,
      locale: parsed.value.locale,
      ogImage: parsed.value.ogImage === '' ? null : parsed.value.ogImage,
      published: parsed.value.published,
      publishedAt: parsed.value.published ? new Date() : null,
      relatedPosts: parsed.value.relatedPosts,
      relatedProjects: parsed.value.relatedProjects,
      relatedServices: parsed.value.relatedServices,
      seoDescription: parsed.value.seoDescription,
      seoTitle: parsed.value.seoTitle,
      slug: parsed.value.slug,
      socialContent: getSocialContent(parsed.value.socialContent),
      tags: parsed.value.tags,
      title: parsed.value.title,
      translationGroup: parsed.value.translationGroup === '' ? null : parsed.value.translationGroup,
    },
    where: { id },
  });

  await recordAdminActivity({
    action: post.published ? 'publish' : 'update',
    resource: 'post',
    resourceId: post.id,
    summary: `更新文章「${post.title}」`,
  });
  refreshAdminResource('/admin/blog');
  refreshAdminResource('/blog');
  redirectToAdminResource('/admin/blog', 'success');
}

export async function deleteAdminPost(formData: FormData): Promise<void> {
  const id = getAdminResourceId(formData);

  if (id === undefined) {
    redirectToAdminResource('/admin/blog', 'error');
  }

  const { database } = await getAdminActionContext();
  await database.post.delete({ where: { id } });
  await recordAdminActivity({
    action: 'delete',
    resource: 'post',
    resourceId: id,
    summary: '删除一篇文章',
  });
  refreshAdminResource('/admin/blog');
  refreshAdminResource('/blog');
  redirectToAdminResource('/admin/blog', 'success');
}

function getSocialContent(
  value: Readonly<Record<'douyin' | 'wechat' | 'xiaohongshu', string>>,
): Prisma.InputJsonValue | typeof Prisma.JsonNull {
  const entries = Object.entries(value).filter(([, item]) => item !== '');

  return entries.length === 0
    ? Prisma.JsonNull
    : (Object.fromEntries(entries) as Prisma.InputJsonValue);
}
