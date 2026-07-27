import { ArrowRight } from 'lucide-react';

import { Reveal } from '@/components/animation/reveal';
import { Link } from '@/i18n/navigation';

export type ProcessClosingProps = Readonly<{
  actionLabel: string;
  helper: string;
  lines: readonly [string, string, string, string];
}>;

export function ProcessClosing({
  actionLabel,
  helper,
  lines,
}: ProcessClosingProps): React.JSX.Element {
  return (
    <div className="process-closing">
      <Reveal variant="fade-up">
        <p className="process-closing-statement">
          {lines.map((line) => (
            <span key={line}>{line}</span>
          ))}
        </p>
      </Reveal>
      <Reveal delay={0.08} variant="fade-up">
        <div className="process-closing-action-group">
          <Link className="process-closing-primary" href="/contact">
            <span>{actionLabel}</span>
            <ArrowRight aria-hidden="true" size={18} strokeWidth={1.5} />
          </Link>
          <p>{helper}</p>
        </div>
      </Reveal>
    </div>
  );
}
