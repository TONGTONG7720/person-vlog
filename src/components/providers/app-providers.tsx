'use client';

import type { PropsWithChildren } from 'react';

import { LocaleDocumentAttributes } from '@/components/i18n/locale-document-attributes';
import { AnalyticsProvider } from '@/components/providers/analytics-provider';
import { MotionProvider } from '@/components/providers/motion-provider';
import { PwaProvider } from '@/components/pwa/pwa-provider';
import { SmoothScrollProvider } from '@/components/providers/smooth-scroll-provider';
import { useReducedMotionPreference } from '@/hooks/use-reduced-motion-preference';

export function AppProviders({ children }: PropsWithChildren): React.JSX.Element {
  const prefersReducedMotion = useReducedMotionPreference();

  return (
    <PwaProvider>
      <AnalyticsProvider>
        <LocaleDocumentAttributes />
        <MotionProvider prefersReducedMotion={prefersReducedMotion}>
          <SmoothScrollProvider prefersReducedMotion={prefersReducedMotion}>
            {children}
          </SmoothScrollProvider>
        </MotionProvider>
      </AnalyticsProvider>
    </PwaProvider>
  );
}
