import { Reveal } from '@/components/animation/reveal';
import type { ServiceEngagement } from '@/types/service';

export type ServicesEngagementProps = Readonly<{
  engagements: readonly ServiceEngagement[];
  titleLines: readonly [string, string];
}>;

export function ServicesEngagement({
  engagements,
  titleLines,
}: ServicesEngagementProps): React.JSX.Element {
  return (
    <div className="services-engagement">
      <Reveal variant="fade-up">
        <h3 className="services-engagement-title">
          <span>{titleLines[0]}</span>
          <span>{titleLines[1]}</span>
        </h3>
      </Reveal>
      <div className="services-engagement-list">
        {engagements.map((engagement, index) => (
          <Reveal delay={index * 0.05} key={engagement.number} variant="fade-up">
            <article className="services-engagement-item">
              <p>{engagement.number}</p>
              <h4>{engagement.title}</h4>
              <p>{engagement.description}</p>
            </article>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
