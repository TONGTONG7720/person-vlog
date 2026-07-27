'use client';

import { motion, useInView, type Variants } from 'framer-motion';
import { useRef, type ReactNode } from 'react';

import { useMotionPreference } from '@/components/providers/motion-provider';
import { useMounted } from '@/hooks/use-mounted';
import { cn } from '@/lib/utils';

export type BlogMediaRevealProps = Readonly<{
  children: ReactNode;
  className?: string;
}>;

const coverVariants: Variants = {
  hidden: {
    scale: 1.05,
  },
  visible: {
    scale: 1,
    transition: {
      duration: 0.65,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const maskVariants: Variants = {
  hidden: {
    clipPath: 'inset(0 0 0% 0)',
  },
  visible: {
    clipPath: 'inset(0 0 100% 0)',
    transition: {
      duration: 0.65,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

export function BlogMediaReveal({ children, className }: BlogMediaRevealProps): React.JSX.Element {
  const elementRef = useRef<HTMLDivElement>(null);
  const hasMounted = useMounted();
  const prefersReducedMotion = useMotionPreference();
  const isInView = useInView(elementRef, { amount: 0.2, once: true });
  const shouldReveal = hasMounted && !prefersReducedMotion && isInView;

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div className={cn('blog-media-reveal', className)} ref={elementRef}>
      {shouldReveal ? (
        <motion.div
          animate="visible"
          className="blog-media-reveal-inner"
          initial="hidden"
          variants={coverVariants}
        >
          {children}
        </motion.div>
      ) : (
        <div className="blog-media-reveal-inner">{children}</div>
      )}
      {shouldReveal ? (
        <motion.span
          animate="visible"
          aria-hidden="true"
          className="blog-media-reveal-mask"
          initial="hidden"
          variants={maskVariants}
        />
      ) : null}
    </div>
  );
}
