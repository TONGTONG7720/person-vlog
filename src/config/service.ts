import { z } from 'zod';

import type { Locale } from '@/types/i18n';
import { serviceCategories, type ServiceCategory } from '@/types/service';

const serviceCategorySchema = z.enum(serviceCategories);

export const serviceCategoryLabels = {
  enterprise: '企业管理系统开发',
  ai: 'AI 应用开发',
  automation: 'Python 自动化工具',
  'full-stack': '前后端功能开发',
  maintenance: '系统升级与维护',
  consulting: '技术咨询与产品方案',
} as const satisfies Record<ServiceCategory, string>;

const serviceCategoryLabelsByLocale = {
  'en-US': {
    ai: 'AI application development',
    automation: 'Python automation solutions',
    consulting: 'Product and technical consulting',
    enterprise: 'Enterprise software development',
    'full-stack': 'Full-stack product development',
    maintenance: 'System upgrade and maintenance',
  },
  'zh-CN': serviceCategoryLabels,
} as const satisfies Readonly<Record<Locale, Readonly<Record<ServiceCategory, string>>>>;

export function getServiceCategoryLabels(
  locale: Locale,
): Readonly<Record<ServiceCategory, string>> {
  return serviceCategoryLabelsByLocale[locale];
}

export function parseServiceCategory(
  value: string | readonly string[] | undefined,
): ServiceCategory | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }

  const parsed = serviceCategorySchema.safeParse(value);

  return parsed.success ? parsed.data : undefined;
}
