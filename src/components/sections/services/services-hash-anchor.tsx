'use client';

import { useEffect } from 'react';

import { useMotionPreference } from '@/components/providers/motion-provider';

const servicesHash = '#services';
const initialAnchorSettleDelay = 800;

export function ServicesHashAnchor(): null {
  const prefersReducedMotion = useMotionPreference();

  useEffect(() => {
    let firstFrame: number | undefined;
    let secondFrame: number | undefined;
    let settleTimer: number | undefined;
    let isActive = true;

    const alignServicesAnchor = (waitForInitialScroll: boolean): void => {
      if (window.location.hash !== servicesHash) {
        return;
      }

      const scheduleAlignment = (): void => {
        if (!isActive) {
          return;
        }

        firstFrame = window.requestAnimationFrame(() => {
          secondFrame = window.requestAnimationFrame(() => {
            if (window.location.hash !== servicesHash) {
              return;
            }

            document.getElementById('services')?.scrollIntoView({
              behavior: waitForInitialScroll || prefersReducedMotion ? 'instant' : 'smooth',
              block: 'start',
            });
          });
        });
      };

      const waitForLayout = (): void => {
        settleTimer = window.setTimeout(
          scheduleAlignment,
          waitForInitialScroll ? initialAnchorSettleDelay : 0,
        );
      };

      if (document.fonts === undefined) {
        waitForLayout();
        return;
      }

      void document.fonts.ready.then(waitForLayout);
    };

    const handleHashChange = (): void => {
      alignServicesAnchor(false);
    };

    alignServicesAnchor(true);
    window.addEventListener('hashchange', handleHashChange);

    return () => {
      isActive = false;
      window.removeEventListener('hashchange', handleHashChange);

      if (firstFrame !== undefined) {
        window.cancelAnimationFrame(firstFrame);
      }

      if (secondFrame !== undefined) {
        window.cancelAnimationFrame(secondFrame);
      }

      if (settleTimer !== undefined) {
        window.clearTimeout(settleTimer);
      }
    };
  }, [prefersReducedMotion]);

  return null;
}
