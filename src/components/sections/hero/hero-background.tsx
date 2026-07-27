'use client';

import { useEffect, useRef } from 'react';

import { HeroCodeConstellation } from '@/components/sections/hero/hero-code-constellation';
import { HeroGradient } from '@/components/sections/hero/hero-gradient';
import { useMotionPreference } from '@/components/providers/motion-provider';
import { useMediaQuery } from '@/hooks/use-media-query';

const finePointerQuery = '(hover: hover) and (pointer: fine)';

export function HeroBackground(): React.JSX.Element {
  const backgroundRef = useRef<HTMLDivElement>(null);
  const hasFinePointer = useMediaQuery(finePointerQuery);
  const prefersReducedMotion = useMotionPreference();

  useEffect(() => {
    if (prefersReducedMotion || !hasFinePointer) {
      return;
    }

    const background = backgroundRef.current;

    if (background === null) {
      return;
    }

    let animationFrame: number | undefined;
    let pointerX = 72;
    let pointerY = 38;

    const updatePointerGlow = (): void => {
      animationFrame = undefined;
      const pointerOffsetX = (pointerX - 50) / 50;
      const pointerOffsetY = (pointerY - 50) / 50;

      background.style.setProperty('--hero-pointer-x', `${pointerX}%`);
      background.style.setProperty('--hero-pointer-y', `${pointerY}%`);
      background.style.setProperty(
        '--hero-code-window-shift-x',
        `${(pointerOffsetX * 10).toFixed(2)}px`,
      );
      background.style.setProperty(
        '--hero-code-window-shift-y',
        `${(pointerOffsetY * 8).toFixed(2)}px`,
      );
      background.style.setProperty(
        '--hero-code-window-rotate-x',
        `${(pointerOffsetY * -0.8).toFixed(2)}deg`,
      );
      background.style.setProperty(
        '--hero-code-window-rotate-y',
        `${(pointerOffsetX * 1.1).toFixed(2)}deg`,
      );
    };

    const handlePointerMove = (event: PointerEvent): void => {
      const bounds = background.getBoundingClientRect();

      if (
        event.clientX < bounds.left ||
        event.clientX > bounds.right ||
        event.clientY < bounds.top ||
        event.clientY > bounds.bottom
      ) {
        return;
      }

      pointerX = ((event.clientX - bounds.left) / bounds.width) * 100;
      pointerY = ((event.clientY - bounds.top) / bounds.height) * 100;

      if (animationFrame === undefined) {
        animationFrame = window.requestAnimationFrame(updatePointerGlow);
      }
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);

      if (animationFrame !== undefined) {
        window.cancelAnimationFrame(animationFrame);
      }

      background.style.removeProperty('--hero-pointer-x');
      background.style.removeProperty('--hero-pointer-y');
      background.style.removeProperty('--hero-code-window-shift-x');
      background.style.removeProperty('--hero-code-window-shift-y');
      background.style.removeProperty('--hero-code-window-rotate-x');
      background.style.removeProperty('--hero-code-window-rotate-y');
    };
  }, [hasFinePointer, prefersReducedMotion]);

  return (
    <div aria-hidden="true" className="hero-background" ref={backgroundRef}>
      <HeroGradient />
      <HeroCodeConstellation />
      <div className="hero-background-protection" />
      <div className="hero-bottom-fade" />
    </div>
  );
}
