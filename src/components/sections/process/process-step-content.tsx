import { Check } from 'lucide-react';

import type { ProcessUiCopy } from '@/data/process';
import type { ProcessStep } from '@/types/process';

type ProcessDetailListProps = Readonly<{
  items: readonly string[];
  title: string;
  variant: 'deliverables' | 'focus';
}>;

export type ProcessStepContentProps = Readonly<{
  step: ProcessStep;
  ui: ProcessUiCopy;
}>;

function ProcessDetailList({ items, title, variant }: ProcessDetailListProps): React.JSX.Element {
  return (
    <section className="process-detail-group" data-variant={variant}>
      <h4>{title}</h4>
      <ul>
        {items.map((item) => (
          <li key={item}>
            {variant === 'deliverables' ? (
              <Check aria-hidden="true" size={14} strokeWidth={1.8} />
            ) : null}
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function ProcessStepContent({ step, ui }: ProcessStepContentProps): React.JSX.Element {
  return (
    <div className="process-step-content">
      <header className="process-step-header">
        <p className="process-step-meta">
          <span>{step.number}</span>
          <span>{step.eyebrow}</span>
        </p>
        <h3>{step.title}</h3>
        <p>{step.description}</p>
      </header>
      <div className="process-step-details">
        <ProcessDetailList items={step.focus} title={ui.focus} variant="focus" />
        <ProcessDetailList
          items={step.deliverables}
          title={ui.deliverables}
          variant="deliverables"
        />
      </div>
    </div>
  );
}
