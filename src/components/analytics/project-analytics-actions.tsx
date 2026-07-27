'use client';

import { Link } from '@/i18n/navigation';
import { trackContactClick, trackProjectAction } from '@/lib/analytics';
import type { Project } from '@/types/project';

export type ProjectAnalyticsActionsProps = Readonly<{
  readonly project: Project;
}>;

export function ProjectAnalyticsActions({
  project,
}: ProjectAnalyticsActionsProps): React.JSX.Element {
  return (
    <div className="project-detail-placeholder-actions">
      <Link className="project-detail-placeholder-link" href="/projects">
        返回项目方向
      </Link>
      {project.githubUrl === undefined ? null : (
        <a
          className="project-detail-placeholder-link"
          href={project.githubUrl}
          onClick={() => trackProjectAction(project.slug, 'github')}
          rel="noreferrer"
          target="_blank"
        >
          查看 GitHub
        </a>
      )}
      {project.demoUrl === undefined ? null : (
        <a
          className="project-detail-placeholder-link"
          href={project.demoUrl}
          onClick={() => trackProjectAction(project.slug, 'demo')}
          rel="noreferrer"
          target="_blank"
        >
          在线体验
        </a>
      )}
      <Link
        className="project-detail-placeholder-link"
        href="/contact"
        onClick={() => {
          trackContactClick('projects');
          trackProjectAction(project.slug, 'contact');
        }}
      >
        有类似需求？联系合作
      </Link>
    </div>
  );
}
