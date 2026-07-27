'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

import { ProcessStepContent } from '@/components/sections/process/process-step-content';
import { useMotionPreference } from '@/components/providers/motion-provider';
import type { ProcessUiCopy } from '@/data/process';
import { useMounted } from '@/hooks/use-mounted';
import type { ProcessStep } from '@/types/process';

export type ProcessMobileListProps = Readonly<{
  steps: readonly ProcessStep[];
  ui: ProcessUiCopy;
}>;

export function ProcessMobileList({ steps, ui }: ProcessMobileListProps): React.JSX.Element {
  const listRef = useRef<HTMLOListElement>(null);
  const hasMounted = useMounted();
  const prefersReducedMotion = useMotionPreference();
  const isInView = useInView(listRef, { amount: 0.08, once: true });
  const shouldHideBeforeReveal = hasMounted && !prefersReducedMotion && !isInView;

  return (
    <ol aria-label={ui.stepsAriaLabel} className="process-mobile-story" ref={listRef}>
      {steps.map((step, index) => (
        <motion.li
          animate={shouldHideBeforeReveal ? { opacity: 0, y: 18 } : { opacity: 1, y: 0 }}
          initial={false}
          key={step.id}
          transition={{ delay: index * 0.06, duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
        >
          <ProcessStepContent step={step} ui={ui} />
        </motion.li>
      ))}
    </ol>
  );
}
