import { ArrowUpRight } from 'lucide-react';

import { Reveal } from '@/components/animation/reveal';
import { SectionHeading } from '@/components/typography/section-heading';
import { Container } from '@/components/ui/container';
import { getHomePreviewCopy } from '@/data/home-preview';
import { getAboutSectionCopy } from '@/data/about';
import { getRequestLocale } from '@/i18n/server';
import { Link } from '@/i18n/navigation';

export async function HomeAboutPreview(): Promise<React.JSX.Element> {
  const locale = await getRequestLocale();
  const about = getAboutSectionCopy(locale);
  const copy = getHomePreviewCopy(locale).about;

  return (
    <section aria-labelledby="home-about-heading" className="home-about-preview" id="about">
      <Container size="content">
        <div className="home-about-preview-heading">
          <SectionHeading
            animated
            description={copy.shortDescription}
            eyebrow={about.content.eyebrow}
            id="home-about-heading"
            number={about.content.number}
            size="lg"
            title={copy.title}
          />
        </div>

        <div className="home-about-preview-layout">
          <Reveal className="home-about-signal-rail" distance={16} variant="fade-up">
            <p className="home-preview-kicker">{copy.railLabel}</p>
            <ol className="home-about-signal-list">
              {about.storySteps.map((step) => (
                <li key={step.id}>
                  <span className="home-about-signal-number">{step.number}</span>
                  <div>
                    <h3>{step.title}</h3>
                    <p>{step.keywords.slice(0, 2).join(' / ')}</p>
                  </div>
                </li>
              ))}
            </ol>
          </Reveal>

          <Reveal className="home-about-proof-panel" delay={0.08} distance={16} variant="fade-up">
            <dl className="home-about-proof-metrics">
              {about.metrics.slice(0, 2).map((metric) => (
                <div key={metric.id}>
                  <dt>{metric.label}</dt>
                  <dd>{metric.value}</dd>
                  <p>{metric.description}</p>
                </div>
              ))}
            </dl>
            <Link className="home-preview-link" href="/about">
              <span>{copy.detailAction}</span>
              <ArrowUpRight aria-hidden="true" size={18} strokeWidth={1.5} />
            </Link>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
