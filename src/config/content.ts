import type { Locale } from '@/types/i18n';

export const contentCategoryIds = ['backend', 'frontend', 'ai', 'project', 'engineering'] as const;

export type ContentCategory = (typeof contentCategoryIds)[number];

export type ContentCategoryDefinition = Readonly<{
  readonly description: string;
  readonly id: ContentCategory;
  readonly label: string;
  readonly topics: readonly string[];
}>;

export const contentCategories = [
  {
    description: '围绕企业后端、数据与系统边界，解决真实业务中的稳定性与可维护性问题。',
    id: 'backend',
    label: '后端开发',
    topics: ['Java', 'Spring Boot', 'API', '数据库', '架构'],
  },
  {
    description: '关注管理端和产品界面的结构、状态与可维护交付。',
    id: 'frontend',
    label: '前端开发',
    topics: ['Vue', 'React', 'TypeScript', 'UI'],
  },
  {
    description: '讨论大模型、检索增强和 AI 产品如何进入可验证的业务流程。',
    id: 'ai',
    label: 'AI 应用',
    topics: ['LLM', 'RAG', 'Agent', 'Prompt'],
  },
  {
    description: '把项目中的需求、架构取舍与开发过程沉淀为可复用的案例。',
    id: 'project',
    label: '项目实践',
    topics: ['项目复盘', '架构设计', '开发过程'],
  },
  {
    description: '记录部署、性能、代码质量和长期维护中的工程判断。',
    id: 'engineering',
    label: '工程实践',
    topics: ['部署', '性能', '代码规范'],
  },
] as const satisfies readonly ContentCategoryDefinition[];

export const cjkNonBreakingPhrases = ['业务边界', '知识库'] as const;

export const contentCategoryLabels = {
  ai: 'AI 应用',
  backend: '后端开发',
  engineering: '工程实践',
  frontend: '前端开发',
  project: '项目实践',
} as const satisfies Readonly<Record<ContentCategory, string>>;

const contentCategoryLabelsByLocale = {
  'en-US': {
    ai: 'AI Applications',
    backend: 'Backend Development',
    engineering: 'Engineering Practice',
    frontend: 'Frontend Development',
    project: 'Project Practice',
  },
  'zh-CN': contentCategoryLabels,
} as const satisfies Readonly<Record<Locale, Readonly<Record<ContentCategory, string>>>>;

export function getContentCategoryLabels(
  locale: Locale,
): Readonly<Record<ContentCategory, string>> {
  return contentCategoryLabelsByLocale[locale];
}

export const contentPlanStatuses = [
  'idea',
  'planning',
  'writing',
  'review',
  'published',
  'archived',
] as const;

export type ContentPlanStatus = (typeof contentPlanStatuses)[number];

export const contentPlanStatusLabels = {
  archived: '已归档',
  idea: '选题',
  planning: '规划中',
  published: '已发布',
  review: '待审核',
  writing: '写作中',
} as const satisfies Readonly<Record<ContentPlanStatus, string>>;

export const contentPlanPriorities = ['low', 'normal', 'high'] as const;

export type ContentPlanPriority = (typeof contentPlanPriorities)[number];

export const contentPlanPriorityLabels = {
  high: '高优先级',
  low: '低优先级',
  normal: '正常',
} as const satisfies Readonly<Record<ContentPlanPriority, string>>;

export const contentArticleTemplates = [
  {
    id: 'technical-article',
    label: '技术文章',
    outline: ['背景', '问题', '方案', '实现', '代码', '总结'],
  },
  {
    id: 'project-retrospective',
    label: '项目复盘',
    outline: ['需求', '挑战', '架构', '实现', '结果', '总结'],
  },
  {
    id: 'tutorial',
    label: '教程',
    outline: ['目标', '环境', '步骤', '代码', '总结'],
  },
] as const;

export const socialContentChannels = ['xiaohongshu', 'douyin', 'wechat'] as const;

export type SocialContentChannel = (typeof socialContentChannels)[number];

export type TopicCluster = Readonly<{
  readonly category: ContentCategory;
  readonly id: string;
  readonly pillarTitle: string;
  readonly supportingTopics: readonly string[];
  readonly title: string;
}>;

export const topicClusters = [
  {
    category: 'ai',
    id: 'ai-application-development',
    pillarTitle: '企业 RAG 系统完整指南',
    supportingTopics: ['Embedding 原理', '向量数据库', 'Prompt 优化', 'AI Agent 实践'],
    title: 'AI 应用开发',
  },
  {
    category: 'backend',
    id: 'java-enterprise-systems',
    pillarTitle: 'Spring Boot 企业系统开发指南',
    supportingTopics: ['权限设计', 'MySQL 设计', 'Redis 缓存', '部署'],
    title: 'Java 企业系统',
  },
] as const satisfies readonly TopicCluster[];

export function isContentCategory(value: string): value is ContentCategory {
  return contentCategoryIds.some((category) => category === value);
}

export function normalizeContentCategory(value: string): ContentCategory {
  if (isContentCategory(value)) {
    return value;
  }

  switch (value) {
    case 'java':
      return 'backend';
    case 'architecture':
      return 'engineering';
    default:
      return 'project';
  }
}

export function normalizeContentPlanStatus(value: string): ContentPlanStatus {
  return contentPlanStatuses.some((status) => status === value)
    ? (value as ContentPlanStatus)
    : 'idea';
}

export function normalizeContentPlanPriority(value: string): ContentPlanPriority {
  return contentPlanPriorities.some((priority) => priority === value)
    ? (value as ContentPlanPriority)
    : 'normal';
}
