import { Reveal } from '@/components/animation/reveal';

export type ProjectsSummaryProps = Readonly<{
  ariaLabel: string;
  coverage: readonly string[];
  summary: string;
}>;

export function ProjectsSummary({
  ariaLabel,
  coverage,
  summary,
}: ProjectsSummaryProps): React.JSX.Element {
  return (
    <Reveal className="projects-summary" variant="fade-up">
      <p>{summary}</p>
      <ul aria-label={ariaLabel}>
        {coverage.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </Reveal>
  );
}
