import { getProjectLabels } from '@/config/project';
import type { Locale } from '@/types/i18n';
import type { Project } from '@/types/project';

import { ProjectStatus } from '@/components/sections/projects/project-status';

export type ProjectMetaProps = Readonly<{
  locale: Locale;
  project: Project;
}>;

export function ProjectMeta({ locale, project }: ProjectMetaProps): React.JSX.Element {
  const labels = getProjectLabels(locale);

  return (
    <div className="projects-feature-meta">
      <span>{labels.category[project.category[0]]}</span>
      <span>{project.year}</span>
      <span>{labels.type[project.projectType]}</span>
      <ProjectStatus locale={locale} status={project.status} />
    </div>
  );
}
