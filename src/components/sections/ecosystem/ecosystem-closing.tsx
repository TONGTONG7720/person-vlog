import { Reveal } from '@/components/animation/reveal';

export type EcosystemClosingProps = Readonly<{
  readonly lines: readonly [string, string, string];
}>;

export function EcosystemClosing({ lines }: EcosystemClosingProps): React.JSX.Element {
  return (
    <Reveal className="ecosystem-closing" distance={20} duration={0.65} variant="fade-up">
      <p>
        {lines.map((line) => (
          <span key={line}>{line}</span>
        ))}
      </p>
    </Reveal>
  );
}
