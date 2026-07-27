import { ArrowRight } from 'lucide-react';

import { ServiceDetailContent } from '@/components/sections/services/service-detail-content';
import type { ServicesSectionCopy } from '@/data/services';
import { Link } from '@/i18n/navigation';
import type { Service } from '@/types/service';

export type ServiceStaticListProps = Readonly<{
  labels: ServicesSectionCopy['labels'];
  services: readonly Service[];
  technologyNote: string;
}>;

export function ServiceStaticList({
  labels,
  services,
  technologyNote,
}: ServiceStaticListProps): React.JSX.Element {
  return (
    <div className="services-noscript-list">
      {services.map((service) => (
        <article className="service-static-item" data-accent={service.accent} key={service.id}>
          <header>
            <p>
              <span>{service.number}</span>
              <span>{service.eyebrow}</span>
            </p>
            <h3>{service.title}</h3>
            <p>{service.shortDescription}</p>
          </header>
          <ServiceDetailContent labels={labels} service={service} technologyNote={technologyNote} />
          <Link
            aria-label={`${labels.actionAriaPrefix} ${service.title}`}
            className="service-static-action"
            href={service.action.href}
          >
            <span>{service.action.label}</span>
            <ArrowRight aria-hidden="true" size={18} strokeWidth={1.5} />
          </Link>
        </article>
      ))}
    </div>
  );
}
