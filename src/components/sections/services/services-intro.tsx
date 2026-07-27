import { Reveal } from '@/components/animation/reveal';

export type ServicesIntroProps = Readonly<{
  detail: string;
  lines: readonly [string, string];
}>;

export function ServicesIntro({ detail, lines }: ServicesIntroProps): React.JSX.Element {
  return (
    <div className="services-intro">
      <Reveal variant="fade-up">
        <p className="services-intro-statement">
          <span>{lines[0]}</span>
          <span>{lines[1]}</span>
        </p>
      </Reveal>
      <Reveal delay={0.08} variant="fade-up">
        <p className="services-intro-detail">{detail}</p>
      </Reveal>
    </div>
  );
}
