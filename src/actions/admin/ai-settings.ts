'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { recordAdminActivity } from '@/server/cms/activity';
import {
  parseAiModelConfigForm,
  parseAiPromptForm,
  parseAiToggleForm,
} from '@/server/ai/validation';

import { getAdminActionContext } from './action-utils';

const aiSettingsPath = '/admin/ai/settings';

export async function saveAiModelConfig(formData: FormData): Promise<void> {
  const parsed = parseAiModelConfigForm(formData);

  if (parsed.kind === 'invalid') {
    redirect(`${aiSettingsPath}?error=1`);
  }

  const { database } = await getAdminActionContext();
  const modelConfig = await database.aiModelConfig.upsert({
    create: { ...parsed.value, enabled: true },
    update: { ...parsed.value },
    where: { provider_model: { model: parsed.value.model, provider: parsed.value.provider } },
  });
  await recordAdminActivity({
    action: 'upsert',
    resource: 'ai_model_config',
    resourceId: modelConfig.id,
    summary: '保存 AI 模型配置',
  });
  refreshAiSettings();
  redirect(`${aiSettingsPath}?success=1`);
}

export async function updateAiModelEnabled(formData: FormData): Promise<void> {
  const parsed = parseAiToggleForm(formData);

  if (parsed.kind === 'invalid') {
    redirect(`${aiSettingsPath}?error=1`);
  }

  const { database } = await getAdminActionContext();
  await database.aiModelConfig.update({
    data: { enabled: parsed.value.enabled },
    where: { id: parsed.value.id },
  });
  await recordAdminActivity({
    action: 'update',
    resource: 'ai_model_config',
    resourceId: parsed.value.id,
    summary: '更新 AI 模型启用状态',
  });
  refreshAiSettings();
  redirect(`${aiSettingsPath}?success=1`);
}

export async function updateAiNotificationChannel(formData: FormData): Promise<void> {
  const parsed = parseAiToggleForm(formData);

  if (parsed.kind === 'invalid') {
    redirect(`${aiSettingsPath}?error=1`);
  }

  const { database } = await getAdminActionContext();
  await database.notificationChannel.update({
    data: { enabled: parsed.value.enabled },
    where: { id: parsed.value.id },
  });
  await recordAdminActivity({
    action: 'update',
    resource: 'ai_notification_channel',
    resourceId: parsed.value.id,
    summary: '更新 AI 通知渠道状态',
  });
  refreshAiSettings();
  redirect(`${aiSettingsPath}?success=1`);
}

export async function createAiPromptVersion(formData: FormData): Promise<void> {
  const parsed = parseAiPromptForm(formData);

  if (parsed.kind === 'invalid') {
    redirect('/admin/ai/prompts?error=1');
  }

  const { database } = await getAdminActionContext();
  const latestPrompt = await database.prompt.findFirst({
    orderBy: { version: 'desc' },
    where: { name: parsed.value.name },
  });
  const prompt = await database.prompt.create({
    data: {
      content: parsed.value.content,
      enabled: true,
      name: parsed.value.name,
      version: (latestPrompt?.version ?? 0) + 1,
    },
  });
  await recordAdminActivity({
    action: 'create',
    resource: 'ai_prompt',
    resourceId: prompt.id,
    summary: '创建 AI Prompt 新版本',
  });
  revalidatePath('/admin/ai');
  revalidatePath('/admin/ai/prompts');
  redirect('/admin/ai/prompts?success=1');
}

export async function updateAiPromptEnabled(formData: FormData): Promise<void> {
  const parsed = parseAiToggleForm(formData);

  if (parsed.kind === 'invalid') {
    redirect('/admin/ai/prompts?error=1');
  }

  const { database } = await getAdminActionContext();
  await database.prompt.update({
    data: { enabled: parsed.value.enabled },
    where: { id: parsed.value.id },
  });
  await recordAdminActivity({
    action: 'update',
    resource: 'ai_prompt',
    resourceId: parsed.value.id,
    summary: '更新 AI Prompt 启用状态',
  });
  revalidatePath('/admin/ai');
  revalidatePath('/admin/ai/prompts');
  redirect('/admin/ai/prompts?success=1');
}

function refreshAiSettings(): void {
  revalidatePath('/admin/ai');
  revalidatePath('/admin/ai/settings');
}
