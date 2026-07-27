import { ArrowUpRight } from 'lucide-react';

import { HomeServiceModeSwitcher } from '@/components/sections/services/home-service-mode-switcher';
import { SectionHeading } from '@/components/typography/section-heading';
import { Container } from '@/components/ui/container';
import { getHomePreviewCopy, getHomeServiceModes } from '@/data/home-preview';
import { getServicesSectionCopy } from '@/data/services';
import { getRequestLocale } from '@/i18n/server';
import { Link } from '@/i18n/navigation';

export async function HomeServicesPreview(): Promise<React.JSX.Element> {
  const locale = await getRequestLocale();
  const services = getServicesSectionCopy(locale);
  const copy = getHomePreviewCopy(locale).services;

  return (
    <section
      aria-labelledby="home-services-heading"
      className="home-services-preview"
      id="services"
    >
      <Container size="content">
        <div className="home-services-preview-heading">
          <SectionHeading
            action={
              <Link className="home-preview-link" href="/services">
                <span>{copy.detailAction}</span>
                <ArrowUpRight aria-hidden="true" size={18} strokeWidth={1.5} />
              </Link>
            }
            animated
            eyebrow={services.content.eyebrow}
            id="home-services-heading"
            number={services.content.number}
            size="lg"
            title={copy.title}
          />
        </div>
        <HomeServiceModeSwitcher
          actionLabel={services.content.closingAction}
          ariaLabel={services.labels.listAria}
          modes={getHomeServiceModes(locale)}
          panelLabel={copy.panelLabel}
        />
      </Container>
    </section>
  );
}
