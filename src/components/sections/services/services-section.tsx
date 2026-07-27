import { ServiceMobileAccordion } from '@/components/sections/services/service-mobile-accordion';
import { ServicesClosing } from '@/components/sections/services/services-closing';
import { ServicesDesktopExplorer } from '@/components/sections/services/services-desktop-explorer';
import { ServicesEngagement } from '@/components/sections/services/services-engagement';
import { ServicesHashAnchor } from '@/components/sections/services/services-hash-anchor';
import { ServicesIntro } from '@/components/sections/services/services-intro';
import { SectionHeading } from '@/components/typography/section-heading';
import { Container } from '@/components/ui/container';
import { defaultFeaturedServiceId, getServicesSectionCopy } from '@/data/services';
import { getRequestLocale } from '@/i18n/server';
import { getPublicFeaturedServices } from '@/server/cms/public-content';

export async function ServicesSection(): Promise<React.JSX.Element> {
  const locale = await getRequestLocale();
  const [featuredServices, copy] = await Promise.all([
    getPublicFeaturedServices(locale),
    getServicesSectionCopy(locale),
  ]);
  const firstService = featuredServices[0];
  const defaultOpenServiceId = firstService?.id ?? defaultFeaturedServiceId;

  return (
    <section aria-labelledby="services-heading" className="services-section" id="services">
      <ServicesHashAnchor />
      <Container size="content">
        <div className="services-heading">
          <SectionHeading
            animated
            description={copy.content.description}
            eyebrow={copy.content.eyebrow}
            id="services-heading"
            number={copy.content.number}
            size="lg"
            title={copy.content.title}
          />
        </div>
        <ServicesIntro detail={copy.content.introDetail} lines={copy.content.introLines} />
        <ServicesDesktopExplorer
          defaultOpenServiceId={defaultOpenServiceId}
          labels={copy.labels}
          services={featuredServices}
          technologyNote={copy.content.technologyNote}
        />
        <ServiceMobileAccordion
          defaultOpenServiceId={defaultOpenServiceId}
          labels={copy.labels}
          services={featuredServices}
          technologyNote={copy.content.technologyNote}
        />
        <ServicesEngagement
          engagements={copy.engagements}
          titleLines={copy.content.engagementTitle}
        />
        <ServicesClosing
          actionLabel={copy.content.closingAction}
          helper={copy.content.closingHelper}
          lines={copy.content.closingLines}
        />
      </Container>
    </section>
  );
}
