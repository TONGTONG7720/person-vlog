'use client';

import type { PropsWithChildren } from 'react';
import { useEffect } from 'react';

import Lenis from 'lenis';

import { useMediaQuery } from '@/hooks/use-media-query';

type SmoothScrollProviderProps = PropsWithChildren<{
  readonly prefersReducedMotion: boolean;
}>;

export function SmoothScrollProvider({
  children,
  prefersReducedMotion,
}: SmoothScrollProviderProps): React.JSX.Element {
  const supportsEnhancedScroll = useMediaQuery('(min-width: 768px)');

  useEffect(() => {
    if (prefersReducedMotion || !supportsEnhancedScroll) {
      return;
    }

    const lenis = new Lenis({
      anchors: true,
      autoRaf: true,
      duration: 1,
      smoothWheel: true,
      syncTouch: false,
      touchMultiplier: 1,
    });

    return () => {
      lenis.destroy();
    };
  }, [prefersReducedMotion, supportsEnhancedScroll]);

  return <>{children}</>;
}
