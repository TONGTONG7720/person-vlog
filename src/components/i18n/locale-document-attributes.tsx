'use client';

import { useLocale } from 'next-intl';
import { useLayoutEffect } from 'react';

export function LocaleDocumentAttributes(): null {
  const locale = useLocale();

  useLayoutEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return null;
}
