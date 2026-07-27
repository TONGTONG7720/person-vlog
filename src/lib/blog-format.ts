import type { Locale } from '@/types/i18n';

export function formatBlogDate(date: string, locale: Locale = 'zh-CN'): string {
  const parsedDate = new Date(`${date}T00:00:00.000Z`);

  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }

  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(parsedDate);
}
