'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { AboutMobileStory } from '@/components/sections/about/about-mobile-story';
import { AboutStoryStep, type AboutStoryState } from '@/components/sections/about/about-story-step';
import { AboutVisual } from '@/components/sections/about/about-visual';
import { useMotionPreference } from '@/components/providers/motion-provider';
import { useMediaQuery } from '@/hooks/use-media-query';
import { getGsap } from '@/lib/gsap';

import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { AboutStoryStep as AboutStoryStepData } from '@/types/about';

export type AboutStoryProps = Readonly<{
  keywordsAriaLabel: string;
  mobileIntro: string;
  steps: readonly AboutStoryStepData[];
}>;

function getStoryStepState(index: number, activeIndex: number): AboutStoryState {
  if (index === activeIndex) {
    return 'active';
  }

  return index < activeIndex ? 'completed' : 'inactive';
}

export function AboutStory({
  keywordsAriaLabel,
  mobileIntro,
  steps,
}: AboutStoryProps): React.JSX.Element {
  const storyRef = useRef<HTMLDivElement>(null);
  const stepRefs = useRef<Array<HTMLLIElement | null>>([]);
  const prefersReducedMotion = useMotionPreference();
  const supportsDesktopStory = useMediaQuery('(min-width: 64rem)');
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
    <div className="about-story" ref={storyRef}>
      <div className="about-desktop-story">
        <div className="about-desktop-story-layout">
          <aside aria-hidden="true" className="about-story-visual-shell">
            <div className="about-story-progress">
              {steps.map((step, index) => (
                <span
                  className="about-story-progress-node"
                  data-state={getStoryStepState(index, activeStepIndex)}
                  key={step.id}
                >
                  {step.number}
                </span>
              ))}
            </div>
            {activeStep === undefined ? null : <AboutVisual activeStep={activeStep} />}
          </aside>
          <ol className="about-desktop-story-list">
            {steps.map((step, index) => (
              <AboutStoryStep
                key={step.id}
                ref={setStoryStepRef(index)}
                state={getStoryStepState(index, activeStepIndex)}
                step={step}
                keywordsAriaLabel={keywordsAriaLabel}
              />
            ))}
          </ol>
        </div>
      </div>
      <AboutMobileStory
        keywordsAriaLabel={keywordsAriaLabel}
        mobileIntro={mobileIntro}
        steps={steps}
      />
    </div>
  );
}
