'use client';

import { useCallback, useRef, useState, type KeyboardEvent } from 'react';

import { ServiceDetailPanel } from '@/components/sections/services/service-detail-panel';
import { ServiceList } from '@/components/sections/services/service-list';
import type { ServicesSectionCopy } from '@/data/services';
import { trackServiceView } from '@/lib/analytics';
import type { Service } from '@/types/service';

type ServicesDesktopExplorerProps = Readonly<{
  readonly defaultOpenServiceId: string;
  readonly labels: ServicesSectionCopy['labels'];
  readonly technologyNote: string;
  readonly services: readonly Service[];
}>;

function getNextServiceIndex(index: number, direction: number, serviceCount: number): number {
  if (serviceCount === 0) {
    return 0;
  }

  return (index + direction + serviceCount) % serviceCount;
}

export function ServicesDesktopExplorer({
  defaultOpenServiceId,
  labels,
  services,
  technologyNote,
}: ServicesDesktopExplorerProps): React.JSX.Element | null {
  const [activeServiceId, setActiveServiceId] = useState(defaultOpenServiceId);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const firstService =
    services.find((service) => service.id === defaultOpenServiceId) ?? services[0];

  const activateService = useCallback(
    (serviceId: string): void => {
      setActiveServiceId(serviceId);
      const service = services.find((candidate) => candidate.id === serviceId);

      if (service !== undefined) {
        trackServiceView(service.slug);
      }
    },
    [services],
  );

  const focusService = useCallback(
    (index: number): void => {
      const nextService = services[index];

      if (nextService === undefined) {
        return;
      }

      activateService(nextService.id);
      tabRefs.current[index]?.focus();
    },
    [activateService, services],
  );

  const handleTabKeyDown = useCallback(
    (event: KeyboardEvent<HTMLButtonElement>, index: number): void => {
      switch (event.key) {
        case 'ArrowDown':
        case 'ArrowRight':
          event.preventDefault();
          focusService(getNextServiceIndex(index, 1, services.length));
          break;
        case 'ArrowUp':
        case 'ArrowLeft':
          event.preventDefault();
          focusService(getNextServiceIndex(index, -1, services.length));
          break;
        case 'End':
          event.preventDefault();
          focusService(services.length - 1);
          break;
        case 'Home':
          event.preventDefault();
          focusService(0);
          break;
        default:
          break;
      }
    },
    [focusService, services.length],
  );

  if (firstService === undefined) {
    return null;
  }

  const activeService = services.find((service) => service.id === activeServiceId) ?? firstService;

  return (
    <div className="services-desktop-explorer">
      <div className="services-desktop-layout">
        <ServiceList
          activeServiceId={activeService.id}
          labels={labels}
          onActivate={activateService}
          onKeyDown={handleTabKeyDown}
          services={services}
          setButtonRef={(index, element) => {
            tabRefs.current[index] = element;
          }}
        />
        <ServiceDetailPanel
          labels={labels}
          service={activeService}
          technologyNote={technologyNote}
        />
      </div>
    </div>
  );
}
