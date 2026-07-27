import { ArrowUpRight } from 'lucide-react';
import type { KeyboardEvent } from 'react';

import type { ServicesSectionCopy } from '@/data/services';
import type { Service } from '@/types/service';

export type ServiceListItemProps = Readonly<{
  buttonRef: (element: HTMLButtonElement | null) => void;
  isActive: boolean;
  labels: ServicesSectionCopy['labels'];
  onActivate: () => void;
  onKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => void;
  service: Service;
}>;

export function ServiceListItem({
  buttonRef,
  isActive,
  labels,
  onActivate,
  onKeyDown,
  service,
}: ServiceListItemProps): React.JSX.Element {
  return (
    <button
      aria-controls={`services-panel-${service.id}`}
      aria-selected={isActive}
      className="service-list-item"
      data-accent={service.accent}
      data-state={isActive ? 'active' : 'inactive'}
      id={`services-tab-${service.id}`}
      onClick={onActivate}
      onKeyDown={onKeyDown}
      ref={buttonRef}
      role="tab"
      tabIndex={isActive ? 0 : -1}
      type="button"
    >
      <span className="service-list-item-number">{service.number}</span>
      <span className="service-list-item-main">
        <span className="service-list-item-title-row">
          <span aria-level={3} className="service-list-item-title" role="heading">
            {service.title}
          </span>
          <span className="service-list-item-eyebrow">{service.eyebrow}</span>
        </span>
        <span className="service-list-item-description">{service.shortDescription}</span>
      </span>
      <span className="service-list-item-indicator">
        <span className="service-list-item-status">
          <span aria-hidden="true" className="service-list-item-status-dot" />
          {isActive ? labels.active : labels.detail}
        </span>
        <ArrowUpRight
          aria-hidden="true"
          className="service-list-item-arrow"
          size={20}
          strokeWidth={1.5}
        />
      </span>
    </button>
  );
}
