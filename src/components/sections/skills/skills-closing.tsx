import { ArrowRight } from 'lucide-react';
import { Link } from '@/i18n/navigation';

export type SkillsClosingProps = Readonly<{
  actionLabel: string;
  lines: readonly [string, string];
}>;

export function SkillsClosing({ actionLabel, lines }: SkillsClosingProps): React.JSX.Element {
  return (
    <div className="skills-closing">
      <p className="skills-closing-statement">
        <span>{lines[0]}</span>
        <span>{lines[1]}</span>
      </p>
      <Link className="skills-closing-link" href="/projects">
        <span>{actionLabel}</span>
        <ArrowRight
          aria-hidden="true"
          className="skills-closing-link-icon"
          size={18}
          strokeWidth={1.5}
        />
      </Link>
    </div>
  );
}
