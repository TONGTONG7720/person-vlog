'use client';

import { motion } from 'framer-motion';

import { useMotionPreference } from '@/components/providers/motion-provider';
import type { ProcessSectionContent, ProcessStep, ProcessVisualLayer } from '@/types/process';

type ProcessVisualLayerState = 'active' | 'completed' | 'pending';

export type ProcessVisualProps = Readonly<{
  activeStep: ProcessStep;
  content: ProcessSectionContent;
  layers: readonly ProcessVisualLayer[];
}>;

function getLayerState(index: number, activeIndex: number): ProcessVisualLayerState {
  if (index === activeIndex) {
    return 'active';
  }

  return index < activeIndex ? 'completed' : 'pending';
}

export function ProcessVisual({
  activeStep,
  content,
  layers,
}: ProcessVisualProps): React.JSX.Element {
  const prefersReducedMotion = useMotionPreference();
  const activeLayerIndex = Math.max(
    0,
    layers.findIndex((layer) => layer.visualState === activeStep.visualState),
  );

  return (
    <div aria-hidden="true" className="process-visual" data-active-state={activeStep.visualState}>
      <div className="process-visual-header">
        <span>{content.visualTitle}</span>
        <span>{activeStep.number}</span>
      </div>
      <div className="process-visual-system">
        <svg className="process-visual-path" viewBox="0 0 100 100">
          <path d="M50 4V96" pathLength="1" />
        </svg>
        <div className="process-visual-layers">
          {layers.map((layer, index) => {
            const state = getLayerState(index, activeLayerIndex);
            const shouldMove = !prefersReducedMotion && state === 'active';

            return (
              <motion.div
                animate={{ opacity: state === 'pending' ? 0.38 : 1, x: shouldMove ? 0 : -8 }}
                className="process-visual-layer"
                data-state={state}
                initial={false}
                key={layer.visualState}
                transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="process-visual-layer-heading">
                  <span>{layer.code}</span>
                  <span>{layer.label}</span>
                </div>
                <div className="process-visual-module-list">
                  {layer.modules.map((module) => (
                    <span key={module}>{module}</span>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
      <p>{content.visualFooter}</p>
    </div>
  );
}
