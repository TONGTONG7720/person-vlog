'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useTransition } from 'react';

import { defaultLocale, isLocale } from '@/i18n/config';
import { usePathname, useRouter } from '@/i18n/navigation';
import type { Locale } from '@/types/i18n';

export type LanguageSwitcherProps = Readonly<{
  readonly className?: string;
}>;

const availableLocales = ['zh-CN', 'en-US'] as const satisfies readonly Locale[];

export function LanguageSwitcher({ className }: LanguageSwitcherProps): React.JSX.Element {
  const localeFromProvider = useLocale();
  const currentLocale = isLocale(localeFromProvider) ? localeFromProvider : defaultLocale;
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations('language');
  const [isPending, startTransition] = useTransition();

  const switchLocale = (locale: Locale): void => {
    if (locale === currentLocale) {
      return;
    }

    startTransition(() => {
      router.replace(pathname, { locale });
    });
  };

  return (
    <div aria-label={t('label')} className={className} role="group">
      {availableLocales.map((locale) => {
        const isCurrent = locale === currentLocale;
        const languageLabel = locale === 'zh-CN' ? '中' : 'EN';

        return (
          <button
            aria-label={locale === 'zh-CN' ? t('switchToZh') : t('switchToEn')}
            aria-pressed={isCurrent}
            className="hover:bg-raised-hover data-[current=true]:border-border-default data-[current=true]:bg-raised data-[current=true]:text-ink inline-flex min-h-11 min-w-11 items-center justify-center rounded-sm border border-transparent px-2 text-xs font-semibold tracking-[0.04em] transition-colors duration-[var(--motion-fast)] focus-visible:outline-offset-2 disabled:cursor-wait disabled:opacity-70"
            data-current={isCurrent}
            disabled={isPending}
            key={locale}
            onClick={() => switchLocale(locale)}
            type="button"
          >
            {languageLabel}
          </button>
        );
      })}
    </div>
  );
}
