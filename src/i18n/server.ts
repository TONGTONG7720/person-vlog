import { getLocale } from 'next-intl/server';

import { defaultLocale, isLocale } from '@/i18n/config';
import type { Locale } from '@/types/i18n';

export async function getRequestLocale(): Promise<Locale> {
  const requestedLocale = await getLocale();

  return isLocale(requestedLocale) ? requestedLocale : defaultLocale;
}
