'use client';

import { useTranslations } from 'next-intl';

import { mainNavigation } from '@/config/navigation';
import { Link } from '@/i18n/navigation';
import { trackContactClick } from '@/lib/analytics';

export function FooterNavigation(): React.JSX.Element {
  const t = useTranslations('nav');
  const footer = useTranslations('footer');

  return (
    <nav aria-label={footer('explore')}>
      <p className="type-caption text-subtle font-mono tracking-[0.08em]">{footer('explore')}</p>
      <ul className="mt-4 space-y-2">
        {mainNavigation.map((item) => (
          <li key={item.href}>
            <Link
              className="text-muted hover:text-ink inline-flex min-h-11 items-center text-sm transition-colors duration-[var(--motion-fast)] focus-visible:rounded-sm"
              href={item.href}
              onClick={() => {
                if (item.href === '/contact') {
                  trackContactClick('footer');
                }
              }}
            >
              {t(item.id)}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
