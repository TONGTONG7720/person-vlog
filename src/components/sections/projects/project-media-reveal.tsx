'use client';

import { motion, useInView, type Variants } from 'framer-motion';
import { useRef, type ReactNode } from 'react';

import { useMotionPreference } from '@/components/providers/motion-provider';
import { useMounted } from '@/hooks/use-mounted';
import { cn } from '@/lib/utils';

export type ProjectMediaRevealProps = Readonly<{
  children: ReactNode;
  className?: string;
}>;

const maskRevealVariants: Variants = {
  hidden: {
    clipPath: 'inset(0 0 0% 0)',
    scale: 1.055,
  },
  visible: {
    clipPath: 'inset(0 0 100% 0)',
    scale: 1,
    transition: {
      duration: 1.02,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

export function ProjectMediaReveal({
  children,
  className,
}: ProjectMediaRevealProps): React.JSX.Element {
  const elementRef = useRef<HTMLDivElement>(null);
  const hasMounted = useMounted();
  const prefersReducedMotion = useMotionPreference();
  const isInView = useInView(elementRef, { amount: 0.2, once: true });
  const shouldReveal = hasMounted && !prefersReducedMotion && isInView;

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div className={cn('projects-media-reveal', className)} ref={elementRef}>
      <div className="projects-media-reveal-inner">{children}</div>
      {shouldReveal ? (
        <motion.span
          animate="visible"
          aria-hidden="true"
          className="projects-media-reveal-mask"
          initial="hidden"
          variants={maskRevealVariants}
        />
      ) : null}
    </div>
  );
}
