import { ArrowUpRight } from 'lucide-react';

import type { OpenSourceProject } from '@/types/open-source';

export type OpenSourceItemProps = Readonly<{
  readonly project: OpenSourceProject;
}>;

export function OpenSourceItem({ project }: OpenSourceItemProps): React.JSX.Element {
  const destination = [project.githubUrl, project.url].find(
    (url) => url !== undefined && url.trim().length > 0,
  );

  return (
    <article className="ecosystem-project-item">
      <div className="ecosystem-project-summary">
        <p className="ecosystem-project-status">{project.status}</p>
        <h4 className="ecosystem-project-title">{project.title}</h4>
        <p className="ecosystem-project-description">{project.description}</p>
      </div>
      <ul aria-label={`${project.title} 技术栈`} className="ecosystem-project-technologies">
        {project.technologies.map((technology) => (
          <li key={technology}>{technology}</li>
        ))}
      </ul>
      {destination === undefined ? (
        <span className="ecosystem-project-pending">链接整理中</span>
      ) : (
        <a
          aria-label={`查看 ${project.title}`}
          className="ecosystem-inline-link ecosystem-project-link"
          href={destination}
          rel="noreferrer"
          target="_blank"
        >
          查看项目
          <ArrowUpRight aria-hidden="true" size={16} strokeWidth={1.5} />
        </a>
      )}
    </article>
  );
}
