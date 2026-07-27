import { NotificationChannelType, type PrismaClient } from '@/generated/prisma/client';

const defaultPrompts = [
  {
    content: '识别客户目标、关键约束与待确认问题；不做报价、周期或交付承诺。',
    name: 'lead-agent',
  },
  {
    content: '以清晰的模块、技术建议和风险说明形成初版方案；必须由人工审核。',
    name: 'proposal-agent',
  },
  {
    content: '生成可编辑的内容角度，不发布、不编造案例或数据。',
    name: 'content-agent',
  },
  {
    content: '整理可审核的站内知识，明确来源与未确认边界。',
    name: 'knowledge-agent',
  },
  {
    content: '将项目拆成可审核的任务建议，不自动变更交付计划。',
    name: 'project-agent',
  },
  {
    content: '准确区分已确认事项、待确认问题和下一步行动。',
    name: 'meeting-agent',
  },
] as const;

const defaultNotificationChannels = [
  NotificationChannelType.EMAIL,
  NotificationChannelType.WECHAT,
  NotificationChannelType.TELEGRAM,
] as const;

export async function ensureAiAutomationDefaults(database: PrismaClient): Promise<void> {
  await Promise.all([
    ...defaultPrompts.map(async (prompt) => {
      await database.prompt.upsert({
        create: { ...prompt, enabled: true, version: 1 },
        update: {},
        where: { name_version: { name: prompt.name, version: 1 } },
      });
    }),
    ...defaultNotificationChannels.map(async (type) => {
      await database.notificationChannel.upsert({
        create: { enabled: type === NotificationChannelType.EMAIL, type },
        update: {},
        where: { type },
      });
    }),
  ]);
}
