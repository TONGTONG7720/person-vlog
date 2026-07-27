'use client';

import { motion, useInView, type Variants } from 'framer-motion';
import { createContext, useContext, useRef, type ReactNode } from 'react';

import { useMotionPreference } from '@/components/providers/motion-provider';
import { useMounted } from '@/hooks/use-mounted';
import { cn } from '@/lib/utils';

export type StaggerProps = Readonly<{
  children: ReactNode;
  className?: string;
  delayChildren?: number;
  staggerChildren?: number;
}>;

export type StaggerItemProps = Readonly<{
  children: ReactNode;
  className?: string;
}>;

const staggerItemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
    },
    y: 0,
  },
};

const StaggerReducedMotionContext = createContext(false);

export function Stagger({
  children,
  className,
  delayChildren = 0.05,
  staggerChildren = 0.08,
}: StaggerProps): React.JSX.Element {
  const elementRef = useRef<HTMLDivElement>(null);
  const hasMounted = useMounted();
  const prefersReducedMotion = useMotionPreference();
  const isInView = useInView(elementRef, { amount: 0.2, once: true });
  const shouldHideBeforeReveal = hasMounted && !prefersReducedMotion && !isInView;
  const variants: Variants = {
    hidden: {},
    visible: {
      transition: {
        delayChildren: prefersReducedMotion ? 0 : delayChildren,
        staggerChildren: prefersReducedMotion ? 0 : staggerChildren,
      },
    },
  };

  return (
    <StaggerReducedMotionContext.Provider value={prefersReducedMotion}>
      <motion.div
        animate={shouldHideBeforeReveal ? 'hidden' : 'visible'}
        className={className}
        initial={false}
        ref={elementRef}
        variants={variants}
      >
        {children}
      </motion.div>
    </StaggerReducedMotionContext.Provider>
  );
}

export function StaggerItem({ children, className }: StaggerItemProps): React.JSX.Element {
  const prefersReducedMotion = useContext(StaggerReducedMotionContext);

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div className={cn(className)} variants={staggerItemVariants}>
      {children}
    </motion.div>
  );
}
