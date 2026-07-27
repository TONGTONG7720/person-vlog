export const crmLeadSources = [
  'hero_cta',
  'projects',
  'services',
  'blog',
  'ai_assistant',
  'xiaohongshu',
  'douyin',
  'github',
  'google',
  'direct',
] as const;

export const crmLeadStatuses = [
  'new',
  'contacted',
  'discovery',
  'proposal',
  'negotiation',
  'won',
  'lost',
] as const;

export const crmLeadPriorities = ['low', 'medium', 'high'] as const;
export const crmLeadActivityTypes = ['note', 'email', 'call', 'meeting', 'status_change'] as const;
export const crmTaskStatuses = ['todo', 'in_progress', 'completed', 'cancelled'] as const;
export const crmProjectStatuses = [
  'planning',
  'design',
  'development',
  'testing',
  'deploy',
  'completed',
] as const;
export const crmProposalStatuses = ['draft', 'sent', 'accepted', 'rejected'] as const;
export const crmLeadTags = [
  'Enterprise',
  'Startup',
  'Personal',
  'AI',
  'System',
  'Automation',
] as const;

export type CrmLeadSource = (typeof crmLeadSources)[number];
export type CrmLeadStatus = (typeof crmLeadStatuses)[number];
export type CrmLeadPriority = (typeof crmLeadPriorities)[number];
export type CrmLeadActivityType = (typeof crmLeadActivityTypes)[number];
export type CrmTaskStatus = (typeof crmTaskStatuses)[number];
export type CrmProjectStatus = (typeof crmProjectStatuses)[number];
export type CrmProposalStatus = (typeof crmProposalStatuses)[number];
export type CrmLeadTag = (typeof crmLeadTags)[number];

export const crmLeadSourceLabels = {
  ai_assistant: 'AI 助手',
  blog: '博客内容',
  direct: '直接访问',
  douyin: '抖音',
  github: 'GitHub',
  google: 'Google',
  hero_cta: '首页 CTA',
  projects: '项目案例',
  services: '服务页面',
  xiaohongshu: '小红书',
} as const satisfies Readonly<Record<CrmLeadSource, string>>;

export const crmLeadStatusLabels = {
  contacted: '已联系',
  discovery: '需求沟通',
  lost: '暂不合作',
  negotiation: '商务洽谈',
  new: '新线索',
  proposal: '方案/报价',
  won: '已成交',
} as const satisfies Readonly<Record<CrmLeadStatus, string>>;

export const crmLeadPriorityLabels = {
  high: '高优先级',
  low: '低优先级',
  medium: '常规优先级',
} as const satisfies Readonly<Record<CrmLeadPriority, string>>;

export const crmLeadActivityTypeLabels = {
  call: '电话沟通',
  email: '邮件',
  meeting: '会议',
  note: '备注',
  status_change: '状态变更',
} as const satisfies Readonly<Record<CrmLeadActivityType, string>>;

export const crmTaskStatusLabels = {
  cancelled: '已取消',
  completed: '已完成',
  in_progress: '进行中',
  todo: '待处理',
} as const satisfies Readonly<Record<CrmTaskStatus, string>>;

export const crmProjectStatusLabels = {
  completed: '已完成',
  deploy: '部署上线',
  design: '设计',
  development: '开发',
  planning: '规划',
  testing: '测试',
} as const satisfies Readonly<Record<CrmProjectStatus, string>>;

export const crmProposalStatusLabels = {
  accepted: '已接受',
  draft: '草稿',
  rejected: '未接受',
  sent: '已发送',
} as const satisfies Readonly<Record<CrmProposalStatus, string>>;

const crmLeadSourceAliases: Readonly<Record<string, CrmLeadSource>> = {
  ai: 'ai_assistant',
  ai_assistant: 'ai_assistant',
  blog: 'blog',
  contact_cta: 'hero_cta',
  direct: 'direct',
  douyin: 'douyin',
  footer: 'direct',
  github: 'github',
  google: 'google',
  hero: 'hero_cta',
  hero_cta: 'hero_cta',
  navigation: 'direct',
  project: 'projects',
  projects: 'projects',
  service: 'services',
  services: 'services',
  xiaohongshu: 'xiaohongshu',
};

export function normalizeCrmLeadSource(value: string | undefined): CrmLeadSource | undefined {
  if (value === undefined) {
    return undefined;
  }

  const normalizedValue = value.trim().toLocaleLowerCase('en-US');

  return crmLeadSourceAliases[normalizedValue];
}
