import { Reveal } from '@/components/animation/reveal';
import type { EcosystemActivity } from '@/types/open-source';

export type TechnicalActivityProps = Readonly<{
  readonly activities: readonly EcosystemActivity[];
  readonly title: string;
  readonly topicsSuffix: string;
}>;

export function TechnicalActivity({
  activities,
  title,
  topicsSuffix,
}: TechnicalActivityProps): React.JSX.Element {
  return (
    <section aria-labelledby="technical-activity-heading" className="ecosystem-activities">
      <Reveal distance={18} duration={0.6} variant="fade-up">
        <div className="ecosystem-section-intro">
          <p className="ecosystem-kicker">TECHNICAL ACTIVITY</p>
          <h3 className="ecosystem-subheading" id="technical-activity-heading">
            {title}
          </h3>
        </div>
      </Reveal>
      <ol className="ecosystem-activity-list">
        {activities.map((activity, index) => (
          <li key={activity.id}>
            <Reveal
              delay={Math.min(index * 0.08, 0.24)}
              distance={18}
              duration={0.6}
              variant="fade-up"
            >
              <article className="ecosystem-activity-item">
                <p className="ecosystem-activity-index">{String(index + 1).padStart(2, '0')}</p>
                <div>
                  <h4>{activity.title}</h4>
                  <p>{activity.description}</p>
                </div>
                <ul aria-label={`${activity.title} ${topicsSuffix}`}>
                  {activity.topics.map((topic) => (
                    <li key={topic}>{topic}</li>
                  ))}
                </ul>
              </article>
            </Reveal>
          </li>
        ))}
      </ol>
    </section>
  );
}
