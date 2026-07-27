import { Reveal } from '@/components/animation/reveal';
import { OpenSourceItem } from '@/components/sections/ecosystem/open-source-item';
import type { OpenSourceProject } from '@/types/open-source';

export type OpenSourceListProps = Readonly<{
  readonly description: string;
  readonly emptyMessage: string;
  readonly projects: readonly OpenSourceProject[];
  readonly title: string;
}>;

export function OpenSourceList({
  description,
  emptyMessage,
  projects,
  title,
}: OpenSourceListProps): React.JSX.Element {
  return (
    <section aria-labelledby="open-source-heading" className="ecosystem-projects">
      <Reveal distance={18} duration={0.6} variant="fade-up">
        <div className="ecosystem-section-intro">
          <p className="ecosystem-kicker">OPEN SOURCE</p>
          <h3 className="ecosystem-subheading" id="open-source-heading">
            {title}
          </h3>
          <p>{description}</p>
        </div>
      </Reveal>
      {projects.length === 0 ? (
        <Reveal delay={0.08} distance={18} duration={0.6} variant="fade-up">
          <div className="ecosystem-empty-state" role="status">
            <p>{emptyMessage}</p>
          </div>
        </Reveal>
      ) : (
        <ol className="ecosystem-project-list">
          {projects.map((project, index) => (
            <li key={project.id}>
              <Reveal
                delay={Math.min(index * 0.08, 0.24)}
                distance={18}
                duration={0.6}
                variant="fade-up"
              >
                <OpenSourceItem project={project} />
              </Reveal>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
