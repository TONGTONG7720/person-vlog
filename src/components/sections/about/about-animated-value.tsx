'use client';

import { useInView } from 'framer-motion';
import { useEffect, useRef } from 'react';

import { useMotionPreference } from '@/components/providers/motion-provider';
import { useMounted } from '@/hooks/use-mounted';

export type AboutAnimatedValueProps = Readonly<{
  value: number;
}>;

function formatMetricValue(value: number): string {
  return String(value).padStart(2, '0');
}

export function AboutAnimatedValue({ value }: AboutAnimatedValueProps): React.JSX.Element {
  const valueRef = useRef<HTMLSpanElement>(null);
  const hasMounted = useMounted();
  const prefersReducedMotion = useMotionPreference();
  const isInView = useInView(valueRef, { amount: 0.7, once: true });

  useEffect(() => {
    if (!hasMounted || !isInView || prefersReducedMotion) {
      return;
    }

    const element = valueRef.current;

    if (element === null) {
      return;
    }

    let animationFrame: number | undefined;
    let startedAt: number | undefined;
    const duration = 1000;

    const animateValue = (timestamp: number): void => {
      startedAt ??= timestamp;
      const progress = Math.min((timestamp - startedAt) / duration, 1);
      const easedProgress = 1 - (1 - progress) ** 3;
      element.textContent = formatMetricValue(Math.round(value * easedProgress));

      if (progress < 1) {
        animationFrame = window.requestAnimationFrame(animateValue);
      }
    };

    animationFrame = window.requestAnimationFrame(animateValue);

    return () => {
      if (animationFrame !== undefined) {
        window.cancelAnimationFrame(animationFrame);
      }
    };
  }, [hasMounted, isInView, prefersReducedMotion, value]);

  return (
    <>
      <span aria-hidden="true" ref={valueRef}>
        {formatMetricValue(value)}
      </span>
      <span className="sr-only">{value}</span>
    </>
  );
}
