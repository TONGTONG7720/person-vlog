'use client';

import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

import { useMotionPreference } from '@/components/providers/motion-provider';

const scrollFadeThreshold = 96;

export function HeroScrollIndicator(): React.JSX.Element {
  const prefersReducedMotion = useMotionPreference();
  const [hasScrolledPastHeroStart, setHasScrolledPastHeroStart] = useState(false);
  const latestScrolledState = useRef(false);

  useEffect(() => {
    let animationFrame: number | undefined;

    const commitScrollState = (): void => {
      animationFrame = undefined;
      const nextScrolledState = window.scrollY > scrollFadeThreshold;

      if (latestScrolledState.current === nextScrolledState) {
        return;
      }

      latestScrolledState.current = nextScrolledState;
      setHasScrolledPastHeroStart(nextScrolledState);
    };

    const scheduleScrollState = (): void => {
      if (animationFrame === undefined) {
        animationFrame = window.requestAnimationFrame(commitScrollState);
      }
    };

    scheduleScrollState();
    document.addEventListener('scroll', scheduleScrollState, { passive: true });

    return () => {
      document.removeEventListener('scroll', scheduleScrollState);

      if (animationFrame !== undefined) {
        window.cancelAnimationFrame(animationFrame);
      }
    };
  }, []);

  return (
    <motion.div
      animate={
        prefersReducedMotion
          ? { opacity: 1, y: 0 }
          : { opacity: hasScrolledPastHeroStart ? 0 : 1, y: hasScrolledPastHeroStart ? -4 : 0 }
      }
      aria-hidden="true"
      className="hero-scroll-indicator"
      transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
    >
      <span className="hero-scroll-indicator-line">
        <span className="hero-scroll-indicator-arrow" />
      </span>
      <span>SCROLL TO EXPLORE</span>
    </motion.div>
  );
}
