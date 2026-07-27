import type { KeyboardEvent } from 'react';

import { ServiceListItem } from '@/components/sections/services/service-list-item';
import type { ServicesSectionCopy } from '@/data/services';
import type { Service } from '@/types/service';

export type ServiceListProps = Readonly<{
  activeServiceId: string;
  labels: ServicesSectionCopy['labels'];
  onActivate: (serviceId: string) => void;
  onKeyDown: (event: KeyboardEvent<HTMLButtonElement>, index: number) => void;
  services: readonly Service[];
  setButtonRef: (index: number, element: HTMLButtonElement | null) => void;
}>;

export function ServiceList({
  activeServiceId,
  labels,
  onActivate,
  onKeyDown,
  services,
  setButtonRef,
}: ServiceListProps): React.JSX.Element {
  return (
    <ul
      aria-label={labels.listAria}
      aria-orientation="vertical"
      className="services-list"
      role="tablist"
    >
      {services.map((service, index) => (
        <li key={service.id} role="presentation">
          <ServiceListItem
            buttonRef={(element) => setButtonRef(index, element)}
            isActive={service.id === activeServiceId}
            labels={labels}
            onActivate={() => onActivate(service.id)}
            onKeyDown={(event) => onKeyDown(event, index)}
            service={service}
          />
        </li>
      ))}
    </ul>
  );
}
