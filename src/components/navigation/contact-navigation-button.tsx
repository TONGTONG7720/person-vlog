'use client';

import { ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { buttonVariants } from '@/components/ui/button-variants';
import { Link } from '@/i18n/navigation';
import { trackContactClick } from '@/lib/analytics';
import { cn } from '@/lib/utils';

export function ContactNavigationButton(): React.JSX.Element {
  const t = useTranslations('nav');

  return (
    <Link
      className={cn(
        buttonVariants({ size: 'md', variant: 'primary' }),
        'group hidden lg:inline-flex',
      )}
      href="/contact"
      onClick={() => trackContactClick('navigation')}
    >
      {t('contactAction')}
      <ArrowRight
        aria-hidden="true"
        className="size-4 transition-transform duration-[var(--motion-fast)] group-hover:translate-x-0.5"
      />
    </Link>
  );
}
