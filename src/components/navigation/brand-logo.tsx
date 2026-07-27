import { useTranslations } from 'next-intl';

import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';

export type BrandLogoProps = Readonly<{
  className?: string;
}>;

export function BrandLogo({ className }: BrandLogoProps): React.JSX.Element {
  const t = useTranslations('site');

  return (
    <Link
      aria-label={`${t('name')}. ${t('title')}`}
      className={cn(
        'font-display text-ink inline-flex min-h-11 items-center text-sm font-semibold tracking-[-0.02em] transition-[letter-spacing,opacity] duration-[var(--motion-fast)] hover:tracking-[0.01em] hover:opacity-85 focus-visible:rounded-sm',
        className,
      )}
      href="/"
    >
      TONG<span className="text-cyan">.</span>
    </Link>
  );
}
