import { AiAgentType, NotificationChannelType } from '@/generated/prisma/client';
import type { AiAutomationAgent, AiNotificationChannelType } from '@/ai/automation-types';

export const aiAgentTypeToPrisma = {
  content: AiAgentType.CONTENT,
  knowledge: AiAgentType.KNOWLEDGE,
  lead: AiAgentType.LEAD,
  meeting: AiAgentType.MEETING,
  project: AiAgentType.PROJECT,
  proposal: AiAgentType.PROPOSAL,
} as const satisfies Readonly<Record<AiAutomationAgent, AiAgentType>>;

export const aiAgentTypeFromPrisma = {
  [AiAgentType.CONTENT]: 'content',
  [AiAgentType.KNOWLEDGE]: 'knowledge',
  [AiAgentType.LEAD]: 'lead',
  [AiAgentType.MEETING]: 'meeting',
  [AiAgentType.PROJECT]: 'project',
  [AiAgentType.PROPOSAL]: 'proposal',
} as const satisfies Readonly<Record<AiAgentType, AiAutomationAgent>>;

export const notificationChannelTypeToPrisma = {
  email: NotificationChannelType.EMAIL,
  telegram: NotificationChannelType.TELEGRAM,
  wechat: NotificationChannelType.WECHAT,
} as const satisfies Readonly<Record<AiNotificationChannelType, NotificationChannelType>>;
