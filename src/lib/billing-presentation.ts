import type {
  OrganizationLifecycleStage,
  PaymentStatus,
  SubscriptionStatus,
} from '@/generated/prisma/client';
import type { PlanLimitFeature } from '@/lib/permissions';

export const billingCycleLabels = {
  MONTHLY: '按月',
  YEARLY: '按年',
} as const;

export const organizationLifecycleLabels = {
  CUSTOMER: '付费客户',
  INACTIVE: '未活跃',
  LEAD: '线索',
  TRIAL: '试用中',
} as const satisfies Readonly<Record<OrganizationLifecycleStage, string>>;

export const paymentStatusLabels = {
  FAILED: '失败',
  PENDING: '处理中',
  REFUNDED: '已退款',
  SUCCEEDED: '已成功',
} as const satisfies Readonly<Record<PaymentStatus, string>>;

export const subscriptionStatusLabels = {
  ACTIVE: '已启用',
  CANCELLED: '已取消',
  EXPIRED: '已过期',
  PAST_DUE: '待处理',
  TRIALING: '试用中',
} as const satisfies Readonly<Record<SubscriptionStatus, string>>;

export const billingUsageFeatureLabels = {
  aiApps: 'AI 应用',
  aiAssistants: 'AI 助手',
  aiDocuments: '知识文档',
  aiMessages: 'AI 调用',
  aiTokens: 'AI Token',
  marketplaceApiRequests: '市场 API 调用',
  marketplaceItems: '市场发布',
  members: '成员',
  projects: '项目',
  storageBytes: '私有存储',
  workspaces: '工作区',
} as const satisfies Readonly<Record<PlanLimitFeature, string>>;

type BillingPriceInput = Readonly<{
  readonly currency: string;
  readonly priceCents: number;
  readonly slug: string;
}>;

export function formatBillingPrice(input: BillingPriceInput): string {
  if (input.slug === 'enterprise') {
    return '联系定制';
  }

  if (input.priceCents <= 0) {
    return '免费';
  }

  return formatBillingAmount(input.priceCents, input.currency);
}

export function formatBillingAmount(amountCents: number, currency: string): string {
  const fractionDigits = amountCents % 100 === 0 ? 0 : 2;

  return new Intl.NumberFormat('zh-CN', {
    currency,
    maximumFractionDigits: fractionDigits,
    minimumFractionDigits: fractionDigits,
    style: 'currency',
  }).format(amountCents / 100);
}

export function formatBillingUsageLimit(feature: PlanLimitFeature, limit: number | null): string {
  switch (feature) {
    case 'aiApps':
      return limit === null ? '不限 AI 应用' : `${formatNumber(limit)} 个 AI 应用`;
    case 'aiAssistants':
      return limit === null ? '不限 AI 助手' : `${formatNumber(limit)} 个 AI 助手`;
    case 'aiDocuments':
      return limit === null ? '不限知识文档' : `${formatNumber(limit)} 份知识文档`;
    case 'aiMessages':
      return limit === null ? '不限 AI 调用' : `${formatNumber(limit)} 次 / 月`;
    case 'aiTokens':
      return limit === null ? '不限 AI Token' : `${formatNumber(limit)} Token / 月`;
    case 'marketplaceApiRequests':
      return limit === null ? '不限市场 API 调用' : `${formatNumber(limit)} 次 / 月`;
    case 'marketplaceItems':
      return limit === null ? '不限市场发布' : `${formatNumber(limit)} 个发布`;
    case 'members':
      return limit === null ? '不限成员' : `${formatNumber(limit)} 名成员`;
    case 'projects':
      return limit === null ? '不限项目' : `${formatNumber(limit)} 个项目`;
    case 'storageBytes':
      return limit === null ? '不限存储' : formatStorageBytes(limit);
    case 'workspaces':
      return limit === null ? '不限工作区' : `${formatNumber(limit)} 个工作区`;
    default:
      return assertNever(feature);
  }
}

export function formatBillingDate(value: string | undefined): string {
  if (value === undefined) {
    return '未设置';
  }

  return new Intl.DateTimeFormat('zh-CN', { dateStyle: 'medium' }).format(new Date(value));
}

export function formatBillingPercentage(value: number): string {
  return new Intl.NumberFormat('zh-CN', { maximumFractionDigits: 1 }).format(value) + '%';
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat('zh-CN').format(value);
}

function formatStorageBytes(value: number): string {
  const gigabyte = 1024 * 1024 * 1024;

  if (value >= gigabyte) {
    return `${new Intl.NumberFormat('zh-CN', { maximumFractionDigits: 1 }).format(value / gigabyte)} GB`;
  }

  return `${new Intl.NumberFormat('zh-CN', { maximumFractionDigits: 0 }).format(value / 1024 / 1024)} MB`;
}

function assertNever(value: never): never {
  throw new BillingPresentationValueError(String(value));
}

class BillingPresentationValueError extends Error {
  public constructor(public readonly value: string) {
    super(`Cannot format billing value: ${value}`);
    this.name = 'BillingPresentationValueError';
  }
}
