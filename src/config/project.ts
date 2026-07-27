import type { Locale } from '@/types/i18n';
import type { ProjectAccent, ProjectCategory, ProjectStatus, ProjectType } from '@/types/project';

export const projectStatusLabels = {
  completed: '已完成',
  concept: '概念阶段',
  'in-progress': '进行中',
} as const satisfies Record<ProjectStatus, string>;

export const projectTypeLabels = {
  client: '客户项目',
  learning: '学习项目',
  'open-source': '开源项目',
  personal: '个人项目',
} as const satisfies Record<ProjectType, string>;

export const projectCategoryLabels = {
  ai: 'AI APPLICATION',
  automation: 'AUTOMATION PLATFORM',
  'enterprise-system': 'ENTERPRISE SYSTEM',
  'full-stack': 'FULL STACK',
  java: 'JAVA',
  'knowledge-system': 'KNOWLEDGE SYSTEM',
  python: 'PYTHON',
  vue: 'VUE',
} as const satisfies Record<ProjectCategory, string>;

export const projectAccentLabels = {
  amber: 'amber',
  blue: 'blue',
  cyan: 'cyan',
  violet: 'violet',
} as const satisfies Record<ProjectAccent, string>;

const projectLabelsByLocale = {
  'en-US': {
    category: projectCategoryLabels,
    status: {
      completed: 'Completed',
      concept: 'Concept',
      'in-progress': 'In progress',
    },
    type: {
      client: 'Client project',
      learning: 'Learning project',
      'open-source': 'Open source',
      personal: 'Independent project',
    },
  },
  'zh-CN': {
    category: projectCategoryLabels,
    status: projectStatusLabels,
    type: projectTypeLabels,
  },
} as const satisfies Readonly<
  Record<
    Locale,
    Readonly<{
      readonly category: Record<ProjectCategory, string>;
      readonly status: Record<ProjectStatus, string>;
      readonly type: Record<ProjectType, string>;
    }>
  >
>;

export function getProjectLabels(locale: Locale) {
  return projectLabelsByLocale[locale];
}
