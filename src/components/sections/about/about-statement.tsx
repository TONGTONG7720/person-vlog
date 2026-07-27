'use client';

import { motion, useInView, type Variants } from 'framer-motion';
import { useRef } from 'react';

import { useMotionPreference } from '@/components/providers/motion-provider';
import { useMounted } from '@/hooks/use-mounted';

const statementEase: [number, number, number, number] = [0.16, 1, 0.3, 1];

export type AboutStatementProps = Readonly<{
  description: string;
  lines: readonly [string, string];
}>;

const lineVariants: Variants = {
  hidden: { opacity: 0, y: '110%' },
  visible: (index: number) => ({
    opacity: 1,
    transition: {
      delay: index * 0.1,
      duration: 0.8,
      ease: statementEase,
    },
    y: '0%',
  }),
};

const descriptionVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    transition: {
      delay: 0.24,
      duration: 0.64,
      ease: statementEase,
    },
    y: 0,
  },
};

export function AboutStatement({ description, lines }: AboutStatementProps): React.JSX.Element {
  const statementRef = useRef<HTMLDivElement>(null);
  const hasMounted = useMounted();
  const prefersReducedMotion = useMotionPreference();
  const isInView = useInView(statementRef, { amount: 0.24, once: true });
  const shouldHideBeforeReveal = hasMounted && !prefersReducedMotion && !isInView;

  return (
    <div className="about-statement" ref={statementRef}>
      <p className="about-statement-quote">
        {lines.map((line, index) => (
          <span className="about-statement-line" key={line}>
            <motion.span
              animate={shouldHideBeforeReveal ? 'hidden' : 'visible'}
              className="about-statement-line-content"
              custom={index}
              initial={false}
              variants={lineVariants}
            >
              {line}
            </motion.span>
          </span>
        ))}
      </p>
      <motion.p
        animate={shouldHideBeforeReveal ? 'hidden' : 'visible'}
        className="about-statement-description"
        initial={false}
        variants={descriptionVariants}
      >
        {description}
      </motion.p>
    </div>
  );
}
