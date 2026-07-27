import { defaultLocale, getLocalePath, locales } from '@/i18n/config';
import { absoluteUrl } from '@/lib/utils';
import type { Locale } from '@/types/i18n';

export type HreflangAlternates = Readonly<Record<Locale | 'x-default', string>>;

export function getHreflangAlternates(pathname: string): HreflangAlternates {
  const alternates = locales.reduce<Partial<Record<Locale, string>>>(
    (result, locale) => ({ ...result, [locale]: absoluteUrl(getLocalePath(pathname, locale)) }),
    {},
  );

  return {
    'en-US': alternates['en-US'] ?? absoluteUrl(getLocalePath(pathname, 'en-US')),
    'x-default': absoluteUrl(getLocalePath(pathname, defaultLocale)),
    'zh-CN': alternates['zh-CN'] ?? absoluteUrl(getLocalePath(pathname, 'zh-CN')),
  };
}
