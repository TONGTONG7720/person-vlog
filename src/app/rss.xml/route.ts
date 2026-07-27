import { defaultLocale } from '@/i18n/config';
import { createRssResponse } from '@/lib/rss';

export const revalidate = 3_600;

export async function GET(): Promise<Response> {
  return createRssResponse(defaultLocale);
}
