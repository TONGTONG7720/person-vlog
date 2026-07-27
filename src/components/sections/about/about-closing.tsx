import { ArrowRight } from 'lucide-react';
import { Link } from '@/i18n/navigation';

export type AboutClosingProps = Readonly<{
  actionLabel: string;
  lines: readonly [string, string];
}>;

export function AboutClosing({ actionLabel, lines }: AboutClosingProps): React.JSX.Element {
  return (
    <div className="about-closing">
      <p className="about-closing-statement">
        <span>{lines[0]}</span>
        <span>{lines[1]}</span>
      </p>
      <Link className="about-closing-link" href="/about">
        <span>{actionLabel}</span>
        <ArrowRight
          aria-hidden="true"
          className="about-closing-link-icon"
          size={18}
          strokeWidth={1.5}
        />
      </Link>
    </div>
  );
}
