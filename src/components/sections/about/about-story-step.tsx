import { forwardRef } from 'react';

import type { AboutStoryStep as AboutStoryStepData } from '@/types/about';

export type AboutStoryState = 'active' | 'completed' | 'inactive';

export type AboutStoryStepProps = Readonly<{
  keywordsAriaLabel: string;
  state: AboutStoryState;
  step: AboutStoryStepData;
}>;

export const AboutStoryStep = forwardRef<HTMLLIElement, AboutStoryStepProps>(
  function AboutStoryStep({ keywordsAriaLabel, state, step }, ref): React.JSX.Element {
    return (
      <li className="about-story-step" data-state={state} ref={ref}>
        <div className="about-story-step-meta">
          <span aria-hidden="true" className="about-story-step-number">
            {step.number}
          </span>
          <span className="about-story-step-label">{step.visualLabel}</span>
        </div>
        <h3 className="about-story-step-title">{step.title}</h3>
        <p className="about-story-step-summary">{step.summary}</p>
        <ul aria-label={keywordsAriaLabel} className="about-story-keywords">
          {step.keywords.map((keyword) => (
            <li key={keyword}>{keyword}</li>
          ))}
        </ul>
      </li>
    );
  },
);

AboutStoryStep.displayName = 'AboutStoryStep';
