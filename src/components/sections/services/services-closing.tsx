'use client';

import { ArrowRight } from 'lucide-react';

import { Reveal } from '@/components/animation/reveal';
import { Link } from '@/i18n/navigation';
import { trackContactClick } from '@/lib/analytics';

export type ServicesClosingProps = Readonly<{
  actionLabel: string;
  helper: string;
  lines: readonly [string, string];
}>;

export function ServicesClosing({
  actionLabel,
  helper,
  lines,
}: ServicesClosingProps): React.JSX.Element {
  return (
    <div className="services-closing">
      <Reveal variant="fade-up">
        <p className="services-closing-statement">
          <span>{lines[0]}</span>
          <span>{lines[1]}</span>
        </p>
      </Reveal>
      <Reveal delay={0.08} variant="fade-up">
        <div className="services-closing-action-group">
          <Link
            className="services-closing-primary"
            href="/contact"
            onClick={() => trackContactClick('services')}
          >
            <span>{actionLabel}</span>
            <ArrowRight aria-hidden="true" size={18} strokeWidth={1.5} />
          </Link>
          <p>{helper}</p>
        </div>
      </Reveal>
    </div>
  );
}
