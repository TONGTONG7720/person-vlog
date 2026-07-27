import { BookOpenText, Boxes, Radio } from 'lucide-react';

import { Reveal } from '@/components/animation/reveal';
import type { EcosystemSectionContent, OpenSourceProject } from '@/types/open-source';
import type { SocialLink } from '@/types/social';

export type EcosystemSnapshotProps = Readonly<{
  readonly content: EcosystemSectionContent;
  readonly labels: Readonly<{
    readonly build: string;
    readonly connect: string;
    readonly write: string;
  }>;
  readonly links: readonly SocialLink[];
  readonly projects: readonly OpenSourceProject[];
}>;

function isExternalUrl(url: string): boolean {
  return url.startsWith('https://') || url.startsWith('http://');
}

export function EcosystemSnapshot({
  content,
  labels,
  links,
  projects,
}: EcosystemSnapshotProps): React.JSX.Element {
  const writing = content.activities.find((activity) => activity.id === 'writing');
  const hasProjects = projects.length > 0;
  const hasLinks = links.length > 0;

  return (
    <div className="ecosystem-snapshot">
      <Reveal distance={16} variant="fade-up">
        <article
          className="ecosystem-snapshot-item"
          data-state={hasProjects ? 'ready' : 'preparing'}
        >
          <header>
            <Boxes aria-hidden="true" size={20} strokeWidth={1.5} />
            <p>{labels.build}</p>
          </header>
          <h3>{content.githubTitle}</h3>
          <p>{hasProjects ? content.projectsDescription : content.projectsEmptyMessage}</p>
          <span>{hasProjects ? content.identity.statement : content.githubDescription}</span>
        </article>
      </Reveal>

      <Reveal delay={0.08} distance={16} variant="fade-up">
        <article className="ecosystem-snapshot-item" data-state="active">
          <header>
            <BookOpenText aria-hidden="true" size={20} strokeWidth={1.5} />
            <p>{labels.write}</p>
          </header>
          <h3>{writing?.title ?? content.activitiesTitle}</h3>
          <p>{writing?.description ?? content.activities[0]?.description}</p>
          <ul>
            {(writing?.topics ?? []).map((topic) => (
              <li key={topic}>{topic}</li>
            ))}
          </ul>
        </article>
      </Reveal>

      <Reveal delay={0.16} distance={16} variant="fade-up">
        <article className="ecosystem-snapshot-item" data-state={hasLinks ? 'ready' : 'preparing'}>
          <header>
            <Radio aria-hidden="true" size={20} strokeWidth={1.5} />
            <p>{labels.connect}</p>
          </header>
          <h3>{content.socialTitle}</h3>
          {hasLinks ? (
            <ul className="ecosystem-snapshot-links">
              {links.map((link) => (
                <li key={link.id}>
                  <a
                    href={link.url}
                    {...(isExternalUrl(link.url) ? { rel: 'noreferrer', target: '_blank' } : {})}
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p>{content.socialEmptyMessage}</p>
          )}
          <span>{content.identity.name}</span>
        </article>
      </Reveal>
    </div>
  );
}
