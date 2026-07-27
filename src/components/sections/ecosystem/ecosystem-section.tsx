import { EcosystemSnapshot } from '@/components/sections/ecosystem/ecosystem-snapshot';
import { SectionHeading } from '@/components/typography/section-heading';
import { Container } from '@/components/ui/container';
import { getEnabledSocialLinks } from '@/config/social';
import { getHomePreviewCopy } from '@/data/home-preview';
import { getEcosystemSectionContent, openSourceProjects } from '@/data/open-source';
import { getRequestLocale } from '@/i18n/server';

function EcosystemLines({
  lines,
}: Readonly<{ readonly lines: readonly string[] }>): React.JSX.Element {
  return (
    <span className="ecosystem-heading-lines">
      {lines.map((line) => (
        <span key={line}>{line}</span>
      ))}
    </span>
  );
}

export async function EcosystemSection(): Promise<React.JSX.Element> {
  const locale = await getRequestLocale();
  const content = getEcosystemSectionContent(locale);
  const labels = getHomePreviewCopy(locale).ecosystem;

  return (
    <section aria-labelledby="ecosystem-heading" className="ecosystem-section" id="ecosystem">
      <Container size="content">
        <div className="ecosystem-heading">
          <SectionHeading
            animated
            eyebrow={content.eyebrow}
            id="ecosystem-heading"
            number={content.number}
            size="lg"
            title={<EcosystemLines lines={content.titleLines} />}
          />
        </div>
        <EcosystemSnapshot
          content={content}
          labels={labels}
          links={getEnabledSocialLinks()}
          projects={openSourceProjects}
        />
      </Container>
    </section>
  );
}
