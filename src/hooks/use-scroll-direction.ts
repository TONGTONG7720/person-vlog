'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

export type ScrollDirection = 'up' | 'down' | null;

export type ScrollState = Readonly<{
  direction: ScrollDirection;
  isScrolled: boolean;
}>;

export type UseScrollDirectionOptions = Readonly<{
  threshold?: number;
  topOffset?: number;
}>;

const defaultOptions = {
  threshold: 8,
  topOffset: 80,
} as const;

const initialScrollState: ScrollState = {
  direction: null,
  isScrolled: false,
};

export function useScrollDirection(options: UseScrollDirectionOptions = {}): ScrollState {
  const pathname = usePathname();
  const threshold = options.threshold ?? defaultOptions.threshold;
  const topOffset = options.topOffset ?? defaultOptions.topOffset;
  const [scrollState, setScrollState] = useState<ScrollState>(initialScrollState);
  const previousScrollY = useRef(0);

  useEffect(() => {
    let animationFrame: number | undefined;
    let hasRouteReset = true;

    const commitScrollState = (): void => {
      animationFrame = undefined;

      const currentScrollY = window.scrollY;
      const distance = currentScrollY - previousScrollY.current;
      const isScrolled = currentScrollY > topOffset;

      setScrollState((previousState) => {
        const direction =
          !isScrolled || hasRouteReset
            ? null
            : Math.abs(distance) < threshold
              ? previousState.direction
              : distance > 0
                ? 'down'
                : 'up';

        if (previousState.direction === direction && previousState.isScrolled === isScrolled) {
          return previousState;
        }

        return { direction, isScrolled };
      });

      hasRouteReset = false;
      previousScrollY.current = currentScrollY;
    };

    const scheduleScrollState = (): void => {
      if (animationFrame === undefined) {
        animationFrame = window.requestAnimationFrame(commitScrollState);
      }
    };

    previousScrollY.current = window.scrollY;
    scheduleScrollState();

    // `scroll` does not bubble, and browsers dispatch the document-level event
    // for the page scroller. Listening there keeps the header state reliable
    // for both native scrolling and Lenis-managed scrolling.
    document.addEventListener('scroll', scheduleScrollState, { passive: true });
    window.addEventListener('scroll', scheduleScrollState, { passive: true });

    return () => {
      document.removeEventListener('scroll', scheduleScrollState);
      window.removeEventListener('scroll', scheduleScrollState);

      if (animationFrame !== undefined) {
        window.cancelAnimationFrame(animationFrame);
      }
    };
  }, [pathname, threshold, topOffset]);

  return scrollState;
}
