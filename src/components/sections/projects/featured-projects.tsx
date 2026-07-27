import type { ProjectsSectionCopy } from '@/data/projects';
import type { Locale } from '@/types/i18n';
import { FeaturedProjectItem } from '@/components/sections/projects/featured-project-item';
import type { Project } from '@/types/project';

export type FeaturedProjectsProps = Readonly<{
  labels: ProjectsSectionCopy['labels'];
  locale: Locale;
  projects: readonly Project[];
}>;

export function FeaturedProjects({
  labels,
  locale,
  projects,
}: FeaturedProjectsProps): React.JSX.Element {
  return (
    <div className="projects-feature-list">
      {projects.map((project) => (
        <FeaturedProjectItem key={project.slug} labels={labels} locale={locale} project={project} />
      ))}
    </div>
  );
}
