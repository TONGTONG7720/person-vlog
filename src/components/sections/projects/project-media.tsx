import { ProjectPreview } from '@/components/project-previews/project-preview';
import { ProjectMediaReveal } from '@/components/sections/projects/project-media-reveal';
import { Link } from '@/i18n/navigation';
import type { Locale } from '@/types/i18n';
import type { Project } from '@/types/project';

export type ProjectMediaProps = Readonly<{
  caseStudyLabel: string;
  locale: Locale;
  project: Project;
}>;

export function ProjectMedia({
  caseStudyLabel,
  locale,
  project,
}: ProjectMediaProps): React.JSX.Element {
  const ariaLabel =
    locale === 'en-US' ? `View ${project.title} case study` : `查看${project.title}案例`;

  return (
    <ProjectMediaReveal className="projects-feature-media">
      <Link
        aria-label={ariaLabel}
        className="projects-feature-media-link"
        href={`/projects/${project.slug}`}
      >
        <div className="projects-feature-media-frame" data-accent={project.accent}>
          <ProjectPreview previewType={project.previewType} />
          <span aria-hidden="true" className="projects-feature-media-action">
            {caseStudyLabel} ↗
          </span>
        </div>
      </Link>
    </ProjectMediaReveal>
  );
}
