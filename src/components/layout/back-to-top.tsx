'use client';

import { ArrowUp } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { useMotionPreference } from '@/components/providers/motion-provider';
import { Button } from '@/components/ui/button';

export function BackToTop(): React.JSX.Element {
  const t = useTranslations('common');
  const prefersReducedMotion = useMotionPreference();

  const handleBackToTop = (): void => {
    window.scrollTo({
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
      top: 0,
    });
  };

  return (
    <Button
      icon={<ArrowUp aria-hidden="true" className="size-4" />}
      onClick={handleBackToTop}
      variant="ghost"
    >
      {t('backToTop')}
    </Button>
  );
}
