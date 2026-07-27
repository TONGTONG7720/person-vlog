export type HeroTechListProps = Readonly<{
  technologies: readonly string[];
}>;

export function HeroTechList({ technologies }: HeroTechListProps): React.JSX.Element {
  return (
    <p className="hero-tech-list" data-hero-tech-list>
      <span className="hero-tech-list-label">CORE STACK</span>
      {technologies.map((technology) => (
        <span className="hero-tech-list-item" key={technology}>
          {technology}
        </span>
      ))}
    </p>
  );
}
