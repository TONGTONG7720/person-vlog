import type { Transition, Variants } from 'framer-motion';

const easeEnter: [number, number, number, number] = [0.22, 1, 0.36, 1];
const easeOut: [number, number, number, number] = [0.16, 1, 0.3, 1];

export const motionTokens = {
  ambient: 16,
  chapter: 0.72,
  fast: 0.18,
  page: 0.56,
  reveal: 0.6,
  standard: 0.24,
} as const;

export const defaultTransition: Transition = {
  duration: motionTokens.standard,
  ease: easeOut,
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: motionTokens.reveal,
      ease: easeEnter,
    },
  },
};

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: motionTokens.reveal,
      ease: easeEnter,
    },
  },
};

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      delayChildren: 0.04,
      staggerChildren: 0.06,
    },
  },
};

export const reducedMotionTransition: Transition = {
  duration: 0.01,
};
