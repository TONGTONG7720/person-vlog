'use client';

import { NextIntlClientProvider } from 'next-intl';
import { usePathname } from 'next/navigation';
import { useEffect, useState, type PropsWithChildren } from 'react';
import type { AbstractIntlMessages } from 'next-intl';

import { getLocaleFromPathname, siteTimeZone } from '@/i18n/config';
import type { Locale } from '@/types/i18n';

const messageLoaders = {
  'en-US': async (): Promise<AbstractIntlMessages> =>
    (await import('@/i18n/messages/en-US.json')).default,
  'zh-CN': async (): Promise<AbstractIntlMessages> =>
    (await import('@/i18n/messages/zh-CN.json')).default,
} as const satisfies Readonly<Record<Locale, () => Promise<AbstractIntlMessages>>>;

export type ClientLocaleProviderProps = PropsWithChildren<{
  initialLocale: Locale;
  initialMessages: AbstractIntlMessages;
}>;

export function ClientLocaleProvider({
  children,
  initialLocale,
  initialMessages,
}: ClientLocaleProviderProps): React.JSX.Element {
  const pathname = usePathname();
  const locale = getLocaleFromPathname(pathname ?? '/');
  const [resolvedLocale, setResolvedLocale] = useState(initialLocale);
  const [resolvedMessages, setResolvedMessages] = useState(initialMessages);

  useEffect(() => {
    if (locale === resolvedLocale) {
      return;
    }

    let isCurrent = true;

    void messageLoaders[locale]().then((messages) => {
      if (!isCurrent) {
        return;
      }

      setResolvedMessages(messages);
      setResolvedLocale(locale);
    });

    return () => {
      isCurrent = false;
    };
  }, [locale, resolvedLocale]);

  return (
    <NextIntlClientProvider
      locale={resolvedLocale}
      messages={resolvedMessages}
      timeZone={siteTimeZone}
    >
      {children}
    </NextIntlClientProvider>
  );
}
