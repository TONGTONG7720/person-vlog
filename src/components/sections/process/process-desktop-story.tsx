'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { ProcessStepContent } from '@/components/sections/process/process-step-content';
import { ProcessTimeline } from '@/components/sections/process/process-timeline';
import { ProcessVisual } from '@/components/sections/process/process-visual';
import { useMotionPreference } from '@/components/providers/motion-provider';
import type { ProcessUiCopy } from '@/data/process';
import { useMediaQuery } from '@/hooks/use-media-query';
import { getGsap } from '@/lib/gsap';
import type { ProcessSectionContent, ProcessStep, ProcessVisualLayer } from '@/types/process';

import { ScrollTrigger } from 'gsap/ScrollTrigger';

export type ProcessDesktopStoryProps = Readonly<{
  content: ProcessSectionContent;
  steps: readonly ProcessStep[];
  ui: ProcessUiCopy;
  visualLayers: readonly ProcessVisualLayer[];
}>;

export function ProcessDesktopStory({
  content,
  steps,
  ui,
  visualLayers,
}: ProcessDesktopStoryProps): React.JSX.Element {
  const storyRef = useRef<HTMLDivElement>(null);
  const stepRefs = useRef<Array<HTMLLIElement | null>>([]);
  const prefersReducedMotion = useMotionPreference();
  const supportsDesktopStory = useMediaQuery('(min-width: 75rem)');
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const activeStep = steps[activeStepIndex] ?? steps[0];

  const setStoryStepRef = useCallback(
    (index: number) =>
      (element: HTMLLIElement | null): void => {
        stepRefs.current[index] = element;
      },
    [],
  );

  const updateActiveStep = useCallback((index: number): void => {
    setActiveStepIndex((currentIndex) => (currentIndex === index ? currentIndex : index));
  }, []);

  useEffect(() => {
    if (prefersReducedMotion || !supportsDesktopStory) {
      return;
    }

    const root = storyRef.current;

    if (root === null) {
      return;
    }

    const gsap = getGsap();
    const context = gsap.context(() => {
      stepRefs.current.forEach((element, index) => {
        if (element === null) {
          return;
        }

        ScrollTrigger.create({
          end: 'bottom center',
          onEnter: () => updateActiveStep(index),
          onEnterBack: () => updateActiveStep(index),
          start: 'top center',
          trigger: element,
        });
      });

      ScrollTrigger.refresh();
    }, root);

    return () => {
      context.revert();
    };
  }, [prefersReducedMotion, supportsDesktopStory, updateActiveStep]);

  return (
    <div className="process-desktop-story" ref={storyRef}>
      <div className="process-desktop-story-layout">
        <aside className="process-desktop-sidebar">
          <ProcessTimeline
            activeStepIndex={activeStepIndex}
            ariaLabel={ui.stepsAriaLabel}
            steps={steps}
          />
          {activeStep === undefined ? null : (
            <ProcessVisual activeStep={activeStep} content={content} layers={visualLayers} />
          )}
        </aside>
        <ol aria-label={ui.stepsAriaLabel} className="process-desktop-step-list">
          {steps.map((step, index) => (
            <li
              data-state={index === activeStepIndex ? 'active' : 'idle'}
              key={step.id}
              ref={setStoryStepRef(index)}
            >
              <ProcessStepContent step={step} ui={ui} />
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
