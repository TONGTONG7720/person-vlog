'use client';

import { Check, ChevronRight } from 'lucide-react';
import { useCallback, useRef, useState, type KeyboardEvent } from 'react';

import type { ProcessUiCopy } from '@/data/process';
import type { ProcessStep, ProcessVisualState } from '@/types/process';

function nextIndex(index: number, direction: number, itemCount: number): number {
  return (index + direction + itemCount) % itemCount;
}

export type CompactProcessPipelineProps = Readonly<{
  readonly detailLabel: string;
  readonly pipelineLabel: string;
  readonly steps: readonly ProcessStep[];
  readonly ui: ProcessUiCopy;
}>;

export function CompactProcessPipeline({
  detailLabel,
  pipelineLabel,
  steps,
  ui,
}: CompactProcessPipelineProps): React.JSX.Element | null {
  const initialStep = steps[0];
  const [activeStepId, setActiveStepId] = useState<ProcessVisualState | null>(
    initialStep?.id ?? null,
  );
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const activateStep = useCallback((stepId: ProcessVisualState): void => {
    setActiveStepId(stepId);
  }, []);

  const focusStep = useCallback(
    (index: number): void => {
      const step = steps[index];

      if (step === undefined) {
        return;
      }

      activateStep(step.id);
      tabRefs.current[index]?.focus();
    },
    [activateStep, steps],
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLButtonElement>, index: number): void => {
      switch (event.key) {
        case 'ArrowDown':
        case 'ArrowRight':
          event.preventDefault();
          focusStep(nextIndex(index, 1, steps.length));
          break;
        case 'ArrowUp':
        case 'ArrowLeft':
          event.preventDefault();
          focusStep(nextIndex(index, -1, steps.length));
          break;
        case 'End':
          event.preventDefault();
          focusStep(steps.length - 1);
          break;
        case 'Home':
          event.preventDefault();
          focusStep(0);
          break;
        default:
          break;
      }
    },
    [focusStep, steps.length],
  );

  if (initialStep === undefined || activeStepId === null) {
    return null;
  }

  const activeStep = steps.find((step) => step.id === activeStepId) ?? initialStep;

  return (
    <div className="compact-process-pipeline">
      <div aria-label={pipelineLabel} className="compact-process-tablist" role="tablist">
        {steps.map((step, index) => (
          <button
            aria-controls={`process-panel-${step.id}`}
            aria-selected={step.id === activeStep.id}
            className="compact-process-tab"
            data-state={step.id === activeStep.id ? 'active' : 'inactive'}
            id={`process-tab-${step.id}`}
            key={step.id}
            onClick={() => activateStep(step.id)}
            onKeyDown={(event) => handleKeyDown(event, index)}
            ref={(element) => {
              tabRefs.current[index] = element;
            }}
            role="tab"
            tabIndex={step.id === activeStep.id ? 0 : -1}
            type="button"
          >
            <span>{step.number}</span>
            <strong>{step.title}</strong>
            <ChevronRight aria-hidden="true" size={16} strokeWidth={1.5} />
          </button>
        ))}
      </div>

      <section
        aria-labelledby={`process-tab-${activeStep.id}`}
        className="compact-process-panel"
        id={`process-panel-${activeStep.id}`}
        role="tabpanel"
        tabIndex={0}
      >
        <p className="compact-process-panel-kicker">
          <span>{detailLabel}</span>
          <span>{activeStep.eyebrow}</span>
        </p>
        <h3>{activeStep.title}</h3>
        <p className="compact-process-panel-description">{activeStep.description}</p>
        <div className="compact-process-panel-deliverables">
          <p>{ui.deliverables}</p>
          <ul>
            {activeStep.deliverables.map((item) => (
              <li key={item}>
                <Check aria-hidden="true" size={15} strokeWidth={1.8} />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
