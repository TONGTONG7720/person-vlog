import { ProcessStepContent } from '@/components/sections/process/process-step-content';
import type { ProcessUiCopy } from '@/data/process';
import type { ProcessStep } from '@/types/process';

export type ProcessStaticListProps = Readonly<{
  steps: readonly ProcessStep[];
  ui: ProcessUiCopy;
}>;

export function ProcessStaticList({ steps, ui }: ProcessStaticListProps): React.JSX.Element {
  return (
    <ol aria-label={ui.stepsAriaLabel} className="process-static-list">
      {steps.map((step) => (
        <li key={step.id}>
          <ProcessStepContent step={step} ui={ui} />
        </li>
      ))}
    </ol>
  );
}
