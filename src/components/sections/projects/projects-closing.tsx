'use client';

import { ArrowRight } from 'lucide-react';

import type { ProjectsSectionCopy } from '@/data/projects';
import { Link } from '@/i18n/navigation';
import { trackContactClick } from '@/lib/analytics';

export type ProjectsClosingProps = Readonly<{
  labels: ProjectsSectionCopy['labels'];
  lines: readonly [string, string];
}>;

export function ProjectsClosing({ labels, lines }: ProjectsClosingProps): React.JSX.Element {
  return (
    <div className="projects-closing">
      <p className="projects-closing-statement">
        <span>{lines[0]}</span>
        <span>{lines[1]}</span>
      </p>
      <div className="projects-closing-actions">
        <Link className="projects-closing-primary" href="/projects">
          <span>{labels.viewAll}</span>
          <ArrowRight aria-hidden="true" size={18} strokeWidth={1.5} />
        </Link>
        <Link
          className="projects-closing-secondary"
          href="/contact"
          onClick={() => trackContactClick('projects')}
        >
          {labels.contact}
        </Link>
      </div>
    </div>
  );
}
