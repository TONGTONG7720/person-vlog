'use client';

import { AnimatePresence, motion, type Variants } from 'framer-motion';
import { usePathname } from 'next/navigation';
import type { PropsWithChildren } from 'react';

import { useMotionPreference } from '@/components/providers/motion-provider';

const pageTransitionVariants: Variants = {
  exit: { opacity: 0, y: -8 },
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.36,
      ease: [0.22, 1, 0.36, 1],
    },
    y: 0,
  },
};

export function PageTransition({ children }: PropsWithChildren): React.JSX.Element {
  const pathname = usePathname();
  const prefersReducedMotion = useMotionPreference();

  return (
    <AnimatePresence initial={false} mode="sync">
      <motion.div
        animate="visible"
        exit={prefersReducedMotion ? { opacity: 1 } : 'exit'}
        initial={prefersReducedMotion ? false : 'hidden'}
        key={pathname}
        variants={pageTransitionVariants}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
