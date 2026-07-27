'use client';

import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

import { ServiceDetailContent } from '@/components/sections/services/service-detail-content';
import { useMotionPreference } from '@/components/providers/motion-provider';
import type { ServicesSectionCopy } from '@/data/services';
import { useMounted } from '@/hooks/use-mounted';
import { Link } from '@/i18n/navigation';
import { trackContactClick } from '@/lib/analytics';
import type { Service } from '@/types/service';

export type ServiceDetailPanelProps = Readonly<{
  labels: ServicesSectionCopy['labels'];
  service: Service;
  technologyNote: string;
}>;

export function ServiceDetailPanel({
  labels,
  service,
  technologyNote,
}: ServiceDetailPanelProps): React.JSX.Element {
  const hasMounted = useMounted();
  const prefersReducedMotion = useMotionPreference();
  const shouldAnimate = hasMounted && !prefersReducedMotion;

  return (
    <div className="service-detail-panel" data-accent={service.accent}>
      <motion.article
        animate={{ opacity: 1, y: 0 }}
        aria-labelledby={`services-tab-${service.id}`}
        className="service-detail-panel-content"
        id={`services-panel-${service.id}`}
        initial={shouldAnimate ? { opacity: 0, y: 8 } : false}
        key={service.id}
        role="tabpanel"
        tabIndex={0}
        transition={{ duration: prefersReducedMotion ? 0 : 0.32, ease: [0.16, 1, 0.3, 1] }}
      >
        <header className="service-detail-panel-header">
          <div>
            <p className="service-detail-panel-meta">
              <span>{service.number}</span>
              <span>{service.eyebrow}</span>
            </p>
            <h3>{service.title}</h3>
            <p>{service.shortDescription}</p>
          </div>
          <span className="service-detail-panel-state">{labels.active}</span>
        </header>
        <ServiceDetailContent labels={labels} service={service} technologyNote={technologyNote} />
        <Link
          aria-label={`${labels.actionAriaPrefix} ${service.title}`}
          className="service-detail-panel-action"
          href={service.action.href}
          onClick={() => trackContactClick('services')}
        >
          <span>{service.action.label}</span>
          <ArrowRight aria-hidden="true" size={18} strokeWidth={1.5} />
        </Link>
      </motion.article>
    </div>
  );
}
