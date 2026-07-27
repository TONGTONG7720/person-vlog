import { ArrowUpRight } from 'lucide-react';

import { Reveal } from '@/components/animation/reveal';
import { ProjectMedia } from '@/components/sections/projects/project-media';
import { ProjectMeta } from '@/components/sections/projects/project-meta';
import type { ProjectsSectionCopy } from '@/data/projects';
import { Link } from '@/i18n/navigation';
import type { Locale } from '@/types/i18n';
import type { Project } from '@/types/project';

export type FeaturedProjectItemProps = Readonly<{
  labels: ProjectsSectionCopy['labels'];
  locale: Locale;
  project: Project;
}>;

export function FeaturedProjectItem({
  labels,
  locale,
  project,
}: FeaturedProjectItemProps): React.JSX.Element {
  const titleId = `project-${project.slug}-title`;

  return (
    <article aria-labelledby={titleId} className="projects-feature" data-accent={project.accent}>
      <Reveal className="projects-feature-heading" distance={18} variant="fade-up">
        <ProjectMeta locale={locale} project={project} />
        <h3 id={titleId}>{project.title}</h3>
      </Reveal>
      <ProjectMedia caseStudyLabel={labels.caseStudy} locale={locale} project={project} />
      <Reveal className="projects-feature-body" delay={0.08} distance={18} variant="fade-up">
        <p className="projects-feature-description">{project.description}</p>
        <p className="projects-feature-solution">
          <span>{labels.solution}</span>
          {project.solution}
        </p>
        <Link className="projects-feature-link" href={`/projects/${project.slug}`}>
          <span>{labels.caseStudy}</span>
          <ArrowUpRight aria-hidden="true" size={18} strokeWidth={1.5} />
        </Link>
      </Reveal>
    </article>
  );
}
