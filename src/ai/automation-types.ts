export const aiAutomationAgents = [
  'lead',
  'proposal',
  'content',
  'knowledge',
  'project',
  'meeting',
] as const;

export type AiAutomationAgent = (typeof aiAutomationAgents)[number];

export const aiAutomationAgentLabels = {
  content: '内容助手',
  knowledge: '知识维护',
  lead: '客户需求分析',
  meeting: '会议总结',
  project: '项目助手',
  proposal: '方案助手',
} as const satisfies Readonly<Record<AiAutomationAgent, string>>;

export function getAiAutomationAgentLabel(agent: string): string {
  return aiAutomationAgentLabels[agent as AiAutomationAgent] ?? agent;
}

export const aiNotificationChannelTypes = ['email', 'wechat', 'telegram'] as const;

export type AiNotificationChannelType = (typeof aiNotificationChannelTypes)[number];
