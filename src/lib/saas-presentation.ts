import type {
  ProjectTaskPriority,
  ProjectTaskStatus,
  WorkspaceProjectStatus,
} from '@/generated/prisma/client';

export const workspaceProjectStatusLabels = {
  COMPLETED: '已完成',
  DEPLOY: '上线准备',
  DESIGN: '设计中',
  DEVELOPMENT: '开发中',
  PLANNING: '规划中',
  TESTING: '测试中',
} as const satisfies Readonly<Record<WorkspaceProjectStatus, string>>;

export const projectTaskStatusLabels = {
  DOING: '进行中',
  DONE: '已完成',
  REVIEW: '待确认',
  TODO: '待开始',
} as const satisfies Readonly<Record<ProjectTaskStatus, string>>;

export const projectTaskPriorityLabels = {
  HIGH: '高',
  LOW: '低',
  MEDIUM: '中',
  URGENT: '紧急',
} as const satisfies Readonly<Record<ProjectTaskPriority, string>>;

export function buildSaasOrganizationHref(pathname: string, organizationSlug: string): string {
  const searchParameters = new URLSearchParams({ organization: organizationSlug });

  return `${pathname}?${searchParameters.toString()}`;
}

export function formatSaasDate(value: string | undefined): string {
  if (value === undefined) {
    return '未设置';
  }

  return new Intl.DateTimeFormat('zh-CN', { dateStyle: 'medium' }).format(new Date(value));
}
