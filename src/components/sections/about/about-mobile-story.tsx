import { AboutStoryStep } from '@/components/sections/about/about-story-step';
import type { AboutStoryStep as AboutStoryStepData } from '@/types/about';

export type AboutMobileStoryProps = Readonly<{
  keywordsAriaLabel: string;
  mobileIntro: string;
  steps: readonly AboutStoryStepData[];
}>;

export function AboutMobileStory({
  keywordsAriaLabel,
  mobileIntro,
  steps,
}: AboutMobileStoryProps): React.JSX.Element {
  return (
    <div className="about-mobile-story">
      <p aria-hidden="true" className="about-mobile-story-intro">
        {mobileIntro}
      </p>
      <ol className="about-mobile-story-list">
        {steps.map((step) => (
          <AboutStoryStep
            key={step.id}
            keywordsAriaLabel={keywordsAriaLabel}
            state="active"
            step={step}
          />
        ))}
      </ol>
    </div>
  );
}
