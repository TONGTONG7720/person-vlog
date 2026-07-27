export type ProjectTechListProps = Readonly<{
  label: string;
  technologies: readonly string[];
}>;

export function ProjectTechList({ label, technologies }: ProjectTechListProps): React.JSX.Element {
  return (
    <div className="projects-feature-tech">
      <p>{label}</p>
      <ul>
        {technologies.map((technology) => (
          <li key={technology}>{technology}</li>
        ))}
      </ul>
    </div>
  );
}
