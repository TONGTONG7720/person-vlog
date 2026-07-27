'use server';

import { ProjectStatus } from '@/generated/prisma/client';
import { recordAdminActivity } from '@/server/cms/activity';
import { parseAdminProjectForm } from '@/server/cms/validation';

import {
  getAdminActionContext,
  getAdminResourceId,
  redirectToAdminResource,
  refreshAdminResource,
} from './action-utils';

const projectStatusByFormValue = {
  completed: ProjectStatus.COMPLETED,
  concept: ProjectStatus.CONCEPT,
  'in-progress': ProjectStatus.IN_PROGRESS,
} as const;

export async function createAdminProject(formData: FormData): Promise<void> {
  const parsed = parseAdminProjectForm(formData);

  if (parsed.kind === 'invalid') {
    redirectToAdminResource('/admin/projects', 'error');
  }

  const { database } = await getAdminActionContext();
  const project = await database.project.create({
    data: {
      categories: parsed.value.categories,
      content: parsed.value.content === '' ? null : parsed.value.content,
      coverImage: parsed.value.coverImage === '' ? null : parsed.value.coverImage,
      description: parsed.value.description,
      featured: parsed.value.featured,
      locale: parsed.value.locale,
      slug: parsed.value.slug,
      status: projectStatusByFormValue[parsed.value.status],
      technologies: parsed.value.technologies,
      title: parsed.value.title,
      translationGroup: parsed.value.translationGroup === '' ? null : parsed.value.translationGroup,
    },
  });

  await recordAdminActivity({
    action: 'create',
    resource: 'project',
    resourceId: project.id,
    summary: `创建项目「${project.title}」`,
  });
  refreshAdminResource('/admin/projects');
  refreshAdminResource('/projects');
  redirectToAdminResource('/admin/projects', 'success');
}

export async function updateAdminProject(formData: FormData): Promise<void> {
  const id = getAdminResourceId(formData);
  const parsed = parseAdminProjectForm(formData);

  if (id === undefined || parsed.kind === 'invalid') {
    redirectToAdminResource('/admin/projects', 'error');
  }

  const { database } = await getAdminActionContext();
  const project = await database.project.update({
    data: {
      categories: parsed.value.categories,
      content: parsed.value.content === '' ? null : parsed.value.content,
      coverImage: parsed.value.coverImage === '' ? null : parsed.value.coverImage,
      description: parsed.value.description,
      featured: parsed.value.featured,
      locale: parsed.value.locale,
      slug: parsed.value.slug,
      status: projectStatusByFormValue[parsed.value.status],
      technologies: parsed.value.technologies,
      title: parsed.value.title,
      translationGroup: parsed.value.translationGroup === '' ? null : parsed.value.translationGroup,
    },
    where: { id },
  });

  await recordAdminActivity({
    action: 'update',
    resource: 'project',
    resourceId: project.id,
    summary: `更新项目「${project.title}」`,
  });
  refreshAdminResource('/admin/projects');
  refreshAdminResource('/projects');
  redirectToAdminResource('/admin/projects', 'success');
}

export async function deleteAdminProject(formData: FormData): Promise<void> {
  const id = getAdminResourceId(formData);

  if (id === undefined) {
    redirectToAdminResource('/admin/projects', 'error');
  }

  const { database } = await getAdminActionContext();
  await database.project.delete({ where: { id } });
  await recordAdminActivity({
    action: 'delete',
    resource: 'project',
    resourceId: id,
    summary: '删除一个项目条目',
  });
  refreshAdminResource('/admin/projects');
  refreshAdminResource('/projects');
  redirectToAdminResource('/admin/projects', 'success');
}
