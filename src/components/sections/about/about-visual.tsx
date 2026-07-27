'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

import { useMotionPreference } from '@/components/providers/motion-provider';
import { aboutVisualModules } from '@/data/about';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useMounted } from '@/hooks/use-mounted';
import type { AboutStoryStep, AboutVisualMode } from '@/types/about';

const visualEase: [number, number, number, number] = [0.16, 1, 0.3, 1];

export type AboutVisualProps = Readonly<{
  activeStep: AboutStoryStep;
}>;

function isModuleActive(activeModes: readonly AboutVisualMode[], mode: AboutVisualMode): boolean {
  return activeModes.includes(mode);
}

export function AboutVisual({ activeStep }: AboutVisualProps): React.JSX.Element {
  const visualRef = useRef<HTMLDivElement>(null);
  const hasMounted = useMounted();
  const prefersReducedMotion = useMotionPreference();
  const supportsDesktopStory = useMediaQuery('(min-width: 64rem)');
  const isInView = useInView(visualRef, { amount: 0.18, once: true });
  const shouldAnimate = hasMounted && !prefersReducedMotion && supportsDesktopStory;
  const shouldHideBeforeReveal = shouldAnimate && !isInView;

  return (
    <div className="about-visual-observer" ref={visualRef}>
      <motion.div
        animate={
          shouldHideBeforeReveal
            ? { clipPath: 'inset(100% 0 0 0)', scale: 1.05 }
            : { clipPath: 'inset(0 0 0 0)', scale: 1 }
        }
        className="about-visual"
        data-mode={activeStep.visualMode}
        initial={false}
        transition={shouldAnimate ? { duration: 0.9, ease: visualEase } : { duration: 0 }}
      >
        <div aria-hidden="true" className="about-visual-header">
          <span>SYSTEM MAP</span>
          <span>MODULE 01–08</span>
        </div>
        <div aria-hidden="true" className="about-visual-stage">
          <span className="about-visual-stage-number">{activeStep.number}</span>
          <motion.span
            animate={shouldAnimate ? { opacity: [0.45, 1], y: [8, 0] } : { opacity: 1, y: 0 }}
            className="about-visual-stage-label"
            initial={false}
            key={activeStep.id}
            transition={{ duration: shouldAnimate ? 0.36 : 0, ease: visualEase }}
          >
            {activeStep.visualLabel}
          </motion.span>
        </div>
        <svg aria-hidden="true" className="about-visual-links" viewBox="0 0 320 320">
          <path d="M160 160L50 54" />
          <path d="M160 160L270 54" />
          <path d="M160 160L48 264" />
          <path d="M160 160L272 264" />
        </svg>
        <div aria-hidden="true" className="about-visual-modules">
          {aboutVisualModules.map((module) => {
            const position = module.positions[activeStep.visualMode];
            const isActive = isModuleActive(module.activeModes, activeStep.visualMode);

            return (
              <motion.div
                animate={{
                  opacity: isActive ? 1 : 0.22,
                  scale: isActive ? 1 : 0.92,
                  x: position.x,
                  y: position.y,
                }}
                className="about-visual-module"
                data-active={isActive}
                data-module={module.id}
                initial={false}
                key={module.id}
                transition={{ duration: shouldAnimate ? 0.46 : 0, ease: visualEase }}
              >
                {module.label}
              </motion.div>
            );
          })}
        </div>
        <p aria-hidden="true" className="about-visual-footer">
          BUILD / ITERATE / DEPLOY
        </p>
      </motion.div>
    </div>
  );
}
