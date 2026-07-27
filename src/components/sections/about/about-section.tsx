import { AboutClosing } from '@/components/sections/about/about-closing';
import { AboutMetrics } from '@/components/sections/about/about-metrics';
import { AboutStatement } from '@/components/sections/about/about-statement';
import { AboutStory } from '@/components/sections/about/about-story';
import { Container } from '@/components/ui/container';
import { SectionHeading } from '@/components/typography/section-heading';
import { getAboutSectionCopy } from '@/data/about';
import { getRequestLocale } from '@/i18n/server';

export async function AboutSection(): Promise<React.JSX.Element> {
  const locale = await getRequestLocale();
  const copy = getAboutSectionCopy(locale);

  return (
    <section aria-labelledby="about-heading" className="about-section" id="about">
      <Container size="content">
        <div className="about-intro">
          <SectionHeading
            animated
            description={copy.content.description}
            eyebrow={copy.content.eyebrow}
            id="about-heading"
            number={copy.content.number}
            size="lg"
            title={copy.content.title}
          />
          <AboutStatement
            description={copy.content.statementDescription}
            lines={copy.content.statementLines}
          />
        </div>
        <AboutStory
          keywordsAriaLabel={copy.labels.keywordsAria}
          mobileIntro={copy.labels.mobileStoryIntro}
          steps={copy.storySteps}
        />
        <AboutMetrics metrics={copy.metrics} title={copy.labels.metricsTitle} />
        <AboutClosing actionLabel={copy.labels.aboutLink} lines={copy.content.closingLines} />
      </Container>
    </section>
  );
}
