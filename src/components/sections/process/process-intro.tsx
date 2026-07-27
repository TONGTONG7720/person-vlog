import { Reveal } from '@/components/animation/reveal';

export type ProcessIntroProps = Readonly<{
  description: string;
  lines: readonly [string, string];
}>;

export function ProcessIntro({ description, lines }: ProcessIntroProps): React.JSX.Element {
  return (
    <div className="process-intro">
      <Reveal variant="fade-up">
        <p className="process-intro-statement">
          {lines.map((line) => (
            <span key={line}>{line}</span>
          ))}
        </p>
      </Reveal>
      <Reveal delay={0.08} variant="fade-up">
        <p className="process-intro-detail">{description}</p>
      </Reveal>
    </div>
  );
}
