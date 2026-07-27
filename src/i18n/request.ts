import { getRequestConfig } from 'next-intl/server';

import { defaultLocale, isLocale, siteTimeZone } from '@/i18n/config';

const messageLoaders = {
  'en-US': () => import('@/i18n/messages/en-US.json'),
  'zh-CN': () => import('@/i18n/messages/zh-CN.json'),
} as const;

export default getRequestConfig(async ({ requestLocale }) => {
  const requestedLocale = await requestLocale;
  const locale = isLocale(requestedLocale) ? requestedLocale : defaultLocale;
  const messages = (await messageLoaders[locale]()).default;

  return { locale, messages, timeZone: siteTimeZone };
});
