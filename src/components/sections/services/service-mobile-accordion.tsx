'use client';

import { ChevronDown, ArrowRight } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';

import { ServiceDetailContent } from '@/components/sections/services/service-detail-content';
import { useMotionPreference } from '@/components/providers/motion-provider';
import type { ServicesSectionCopy } from '@/data/services';
import { useMounted } from '@/hooks/use-mounted';
import { Link } from '@/i18n/navigation';
import { trackContactClick, trackServiceView } from '@/lib/analytics';
import type { Service } from '@/types/service';

export type ServiceMobileAccordionProps = Readonly<{
  defaultOpenServiceId: string;
  labels: ServicesSectionCopy['labels'];
  technologyNote: string;
  services: readonly Service[];
}>;

export function ServiceMobileAccordion({
  defaultOpenServiceId,
  labels,
  services,
  technologyNote,
}: ServiceMobileAccordionProps): React.JSX.Element {
  const [openServiceId, setOpenServiceId] = useState(defaultOpenServiceId);
  const hasMounted = useMounted();
  const prefersReducedMotion = useMotionPreference();
  const shouldAnimate = hasMounted && !prefersReducedMotion;

  return (
    <div className="services-mobile-accordion">
      <ul aria-label={labels.listAria} className="services-accordion-list">
        {services.map((service) => {
          const isOpen = service.id === openServiceId;
          const panelId = `services-accordion-panel-${service.id}`;
          const triggerId = `services-accordion-trigger-${service.id}`;

          return (
            <li className="service-accordion-item" data-accent={service.accent} key={service.id}>
              <h3>
                <button
                  aria-controls={panelId}
                  aria-expanded={isOpen}
                  className="service-accordion-trigger"
                  id={triggerId}
                  onClick={() => {
                    if (!isOpen) {
                      trackServiceView(service.slug);
                    }

                    setOpenServiceId(isOpen ? '' : service.id);
                  }}
                  type="button"
                >
                  <span className="service-accordion-number">{service.number}</span>
                  <span className="service-accordion-main">
                    <span className="service-accordion-title">{service.title}</span>
                    <span className="service-accordion-description">
                      {service.shortDescription}
                    </span>
                  </span>
                  <ChevronDown
                    aria-hidden="true"
                    className="service-accordion-icon"
                    data-open={isOpen}
                    size={20}
                    strokeWidth={1.5}
                  />
                </button>
              </h3>
              <AnimatePresence initial={false}>
                {isOpen ? (
                  <motion.div
                    animate={{ height: 'auto', opacity: 1 }}
                    aria-labelledby={triggerId}
                    className="service-accordion-panel"
                    id={panelId}
                    initial={shouldAnimate ? { height: 0, opacity: 0 } : false}
                    role="region"
                    transition={{
                      duration: prefersReducedMotion ? 0 : 0.3,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    {...(shouldAnimate ? { exit: { height: 0, opacity: 0 } } : {})}
                  >
                    <div className="service-accordion-panel-inner">
                      <p className="service-accordion-eyebrow">{service.eyebrow}</p>
                      <ServiceDetailContent
                        labels={labels}
                        service={service}
                        technologyNote={technologyNote}
                      />
                      <Link
                        aria-label={`${labels.actionAriaPrefix} ${service.title}`}
                        className="service-accordion-action"
                        href={service.action.href}
                        onClick={() => trackContactClick('services')}
                      >
                        <span>{service.action.label}</span>
                        <ArrowRight aria-hidden="true" size={18} strokeWidth={1.5} />
                      </Link>
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
