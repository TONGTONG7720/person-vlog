'use client';

import { motion, useInView, type Variants } from 'framer-motion';
import { useRef, type ReactNode } from 'react';

import { useMotionPreference } from '@/components/providers/motion-provider';
import { useMounted } from '@/hooks/use-mounted';

export type RevealVariant =
  'blur' | 'fade' | 'fade-down' | 'fade-up' | 'scale' | 'slide-left' | 'slide-right';

export type RevealProps = Readonly<{
  amount?: number;
  children: ReactNode;
  className?: string;
  delay?: number;
  distance?: number;
  duration?: number;
  once?: boolean;
  variant?: RevealVariant;
}>;

type RevealMotionOptions = Readonly<{
  delay: number;
  distance: number;
  duration: number;
  variant: RevealVariant;
}>;

type RevealTarget = Readonly<{
  filter?: string;
  opacity: number;
  scale?: number;
  x?: number;
  y?: number;
}>;

function createRevealVariants(options: RevealMotionOptions): Variants {
  const hiddenTargets: Readonly<Record<RevealVariant, RevealTarget>> = {
    blur: { filter: 'blur(10px)', opacity: 0, y: options.distance / 2 },
    fade: { opacity: 0 },
    'fade-down': { opacity: 0, y: -options.distance },
    'fade-up': { opacity: 0, y: options.distance },
    scale: { opacity: 0, scale: 0.97 },
    'slide-left': { opacity: 0, x: -options.distance },
    'slide-right': { opacity: 0, x: options.distance },
  };

  return {
    hidden: hiddenTargets[options.variant],
    visible: {
      filter: 'blur(0px)',
      opacity: 1,
      scale: 1,
      transition: {
        delay: options.delay,
        duration: options.duration,
        ease: [0.22, 1, 0.36, 1],
      },
      x: 0,
      y: 0,
    },
  };
}

export function Reveal({
  amount = 0.2,
  children,
  className,
  delay = 0,
  distance = 24,
  duration = 0.6,
  once = true,
  variant = 'fade-up',
}: RevealProps): React.JSX.Element {
  const elementRef = useRef<HTMLDivElement>(null);
  const hasMounted = useMounted();
  const prefersReducedMotion = useMotionPreference();
  const isInView = useInView(elementRef, { amount, once });
  const shouldHideBeforeReveal = hasMounted && !prefersReducedMotion && !isInView;
  const variants = createRevealVariants({ delay, distance, duration, variant });

  return (
    <motion.div
      animate={shouldHideBeforeReveal ? 'hidden' : 'visible'}
      className={className}
      initial={false}
      ref={elementRef}
      variants={variants}
    >
      {children}
    </motion.div>
  );
}
