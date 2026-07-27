import { defineRouting } from 'next-intl/routing';

import type { Locale } from '@/types/i18n';

export const locales = ['zh-CN', 'en-US'] as const satisfies readonly Locale[];

export const defaultLocale: Locale = 'zh-CN';

export const siteTimeZone = 'Asia/Shanghai';

export const localePrefix = {
  'en-US': '/en',
  'zh-CN': '',
} as const satisfies Readonly<Record<Locale, string>>;

export const routing = defineRouting({
  alternateLinks: false,
  defaultLocale,
  localeCookie: {
    maxAge: 60 * 60 * 24 * 365,
    name: 'TONG_LOCALE',
    sameSite: 'lax',
  },
  localeDetection: false,
  localePrefix: {
    mode: 'as-needed',
    prefixes: {
      'en-US': '/en',
    },
  },
  locales,
});

export function isLocale(value: string | undefined): value is Locale {
  return value !== undefined && locales.some((locale) => locale === value);
}

export function getLocalePath(pathname: string, locale: Locale): string {
  const normalizedPathname = pathname.startsWith('/') ? pathname : `/${pathname}`;

  if (locale === defaultLocale) {
    return normalizedPathname;
  }

  return normalizedPathname === '/'
    ? localePrefix[locale]
    : `${localePrefix[locale]}${normalizedPathname}`;
}

export function getLocaleFromPathname(pathname: string): Locale {
  return pathname === '/en' || pathname.startsWith('/en/') ? 'en-US' : defaultLocale;
}
