'use client';

import { motion, useInView, type Variants } from 'framer-motion';
import { useRef, type ReactNode } from 'react';

import { useMotionPreference } from '@/components/providers/motion-provider';
import { useMounted } from '@/hooks/use-mounted';
import { cn } from '@/lib/utils';

export type TextRevealMode = 'block' | 'line';

export type TextRevealProps = Readonly<{
  children: ReactNode;
  className?: string;
  delay?: number;
  mode?: TextRevealMode;
}>;

export function TextReveal({
  children,
  className,
  delay = 0,
  mode = 'line',
}: TextRevealProps): React.JSX.Element {
  const elementRef = useRef<HTMLSpanElement>(null);
  const hasMounted = useMounted();
  const prefersReducedMotion = useMotionPreference();
  const isInView = useInView(elementRef, { amount: 0.2, once: true });
  const shouldHideBeforeReveal = hasMounted && !prefersReducedMotion && !isInView;
  const variants: Variants = {
    hidden: { opacity: 0, y: mode === 'line' ? 16 : 12 },
    visible: {
      opacity: 1,
      transition: {
        delay,
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1],
      },
      y: 0,
    },
  };

  return (
    <span
      className={cn(
        mode === 'line' ? 'block overflow-hidden' : 'inline-block overflow-hidden',
        className,
      )}
    >
      <motion.span
        animate={shouldHideBeforeReveal ? 'hidden' : 'visible'}
        className={mode === 'line' ? 'block' : 'inline-block'}
        initial={false}
        ref={elementRef}
        variants={variants}
      >
        {children}
      </motion.span>
    </span>
  );
}
