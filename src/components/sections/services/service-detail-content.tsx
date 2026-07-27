import type { ServicesSectionCopy } from '@/data/services';
import type { Service } from '@/types/service';

export type ServiceDetailContentProps = Readonly<{
  labels: ServicesSectionCopy['labels'];
  technologyNote: string;
  service: Service;
}>;

type ServiceDetailListProps = Readonly<{
  items: readonly string[];
  title: string;
  variant?: 'default' | 'deliverables' | 'technologies';
}>;

function ServiceDetailList({
  items,
  title,
  variant = 'default',
}: ServiceDetailListProps): React.JSX.Element {
  return (
    <section className="service-detail-group" data-variant={variant}>
      <h4>{title}</h4>
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}

export function ServiceDetailContent({
  labels,
  service,
  technologyNote,
}: ServiceDetailContentProps): React.JSX.Element {
  return (
    <div className="service-detail-content">
      <p className="service-detail-description">{service.description}</p>
      <div className="service-detail-context">
        <ServiceDetailList items={service.suitableFor} title={labels.suitableFor} />
        <ServiceDetailList items={service.problems} title={labels.problems} />
      </div>
      <ServiceDetailList
        items={service.deliverables}
        title={labels.deliverables}
        variant="deliverables"
      />
      <ServiceDetailList
        items={service.technologies}
        title={labels.technologyApproach}
        variant="technologies"
      />
      <p className="service-detail-technology-note">{technologyNote}</p>
      {service.considerations === undefined ? null : (
        <aside className="service-detail-considerations">
          <h4>{labels.considerations}</h4>
          <ul>
            {service.considerations.map((consideration) => (
              <li key={consideration}>{consideration}</li>
            ))}
          </ul>
        </aside>
      )}
    </div>
  );
}
