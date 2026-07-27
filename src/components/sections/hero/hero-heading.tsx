export type HeroHeadingProps = Readonly<{
  compactTitleLines: readonly string[];
  mobileTitleLines: readonly string[];
  title: string;
  titleLines: readonly string[];
}>;

export function HeroHeading({
  compactTitleLines,
  mobileTitleLines,
  title,
  titleLines,
}: HeroHeadingProps): React.JSX.Element {
  return (
    <h1 className="hero-heading" id="hero-heading">
      <span className="sr-only">{title}</span>
      <span aria-hidden="true" className="hero-heading-visual hero-heading-visual--desktop">
        {titleLines.map((line, index) => (
          <span className="hero-heading-line" key={line}>
            <span data-hero-title-line={index}>{line}</span>
          </span>
        ))}
      </span>
      <span aria-hidden="true" className="hero-heading-visual hero-heading-visual--mobile">
        {mobileTitleLines.map((line, index) => (
          <span className="hero-heading-line" key={line}>
            <span data-hero-mobile-title-line={index}>{line}</span>
          </span>
        ))}
      </span>
      <span aria-hidden="true" className="hero-heading-visual hero-heading-visual--compact">
        {compactTitleLines.map((line, index) => (
          <span className="hero-heading-line" key={line}>
            <span data-hero-compact-title-line={index}>{line}</span>
          </span>
        ))}
      </span>
    </h1>
  );
}
