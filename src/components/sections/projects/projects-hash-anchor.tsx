'use client';

import { useEffect } from 'react';

import { useMotionPreference } from '@/components/providers/motion-provider';

const projectsHash = '#projects';
const initialAnchorSettleDelay = 800;

export function ProjectsHashAnchor(): null {
  const prefersReducedMotion = useMotionPreference();

  useEffect(() => {
    let firstFrame: number | undefined;
    let secondFrame: number | undefined;
    let settleTimer: number | undefined;
    let isActive = true;

    const alignProjectsAnchor = (waitForInitialScroll: boolean): void => {
      if (window.location.hash !== projectsHash) {
        return;
      }

      const scheduleAlignment = (): void => {
        if (!isActive) {
          return;
        }

        firstFrame = window.requestAnimationFrame(() => {
          secondFrame = window.requestAnimationFrame(() => {
            if (window.location.hash !== projectsHash) {
              return;
            }

            document.getElementById('projects')?.scrollIntoView({
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
      alignProjectsAnchor(false);
    };

    alignProjectsAnchor(true);
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
