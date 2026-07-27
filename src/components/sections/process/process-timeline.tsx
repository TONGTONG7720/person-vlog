import type { ProcessStep } from '@/types/process';

export type ProcessStepState = 'active' | 'completed' | 'inactive';

export type ProcessTimelineProps = Readonly<{
  activeStepIndex: number;
  ariaLabel: string;
  steps: readonly ProcessStep[];
}>;

function getProcessStepState(index: number, activeIndex: number): ProcessStepState {
  if (index === activeIndex) {
    return 'active';
  }

  return index < activeIndex ? 'completed' : 'inactive';
}

export function ProcessTimeline({
  activeStepIndex,
  ariaLabel,
  steps,
}: ProcessTimelineProps): React.JSX.Element {
  return (
    <ol aria-label={ariaLabel} className="process-timeline" data-active-index={activeStepIndex}>
      {steps.map((step, index) => {
        const state = getProcessStepState(index, activeStepIndex);

        return (
          <li data-state={state} key={step.id}>
            <span aria-hidden="true" className="process-timeline-dot" />
            <span className="process-timeline-copy">
              <span className="process-timeline-number">{step.number}</span>
              <span className="process-timeline-title">{step.title}</span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}
