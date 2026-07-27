'use client';

import { useAnimate } from 'framer-motion';
import { useEffect } from 'react';

import { HeroActions } from '@/components/sections/hero/hero-actions';
import { HeroAvailability } from '@/components/sections/hero/hero-availability';
import { HeroHeading } from '@/components/sections/hero/hero-heading';
import { HeroTechList } from '@/components/sections/hero/hero-tech-list';
import { useMotionPreference } from '@/components/providers/motion-provider';
import type { HeroContent as HeroContentData } from '@/config/home';

const heroEntranceEase: [number, number, number, number] = [0.16, 1, 0.3, 1];

export type HeroContentProps = Readonly<{
  content: HeroContentData;
}>;

export function HeroContent({ content }: HeroContentProps): React.JSX.Element {
  const prefersReducedMotion = useMotionPreference();
  const [scope, animate] = useAnimate();

  useEffect(() => {
    if (prefersReducedMotion) {
      return;
    }

    const controls = [
      animate(
        '[data-hero-eyebrow]',
        { opacity: [0.2, 1], y: [12, 0] },
        { delay: 0.04, duration: 0.48, ease: heroEntranceEase },
      ),
      animate(
        '[data-hero-greeting]',
        { opacity: [0.2, 1], y: [14, 0] },
        { delay: 0.13, duration: 0.56, ease: heroEntranceEase },
      ),
      animate(
        "[data-hero-title-line='0']",
        { opacity: [0.2, 1], y: ['110%', '0%'] },
        { delay: 0.2, duration: 0.85, ease: heroEntranceEase },
      ),
      animate(
        "[data-hero-title-line='1']",
        { opacity: [0.2, 1], y: ['110%', '0%'] },
        { delay: 0.32, duration: 0.85, ease: heroEntranceEase },
      ),
      animate(
        "[data-hero-mobile-title-line='0']",
        { opacity: [0.2, 1], y: ['110%', '0%'] },
        { delay: 0.2, duration: 0.72, ease: heroEntranceEase },
      ),
      animate(
        "[data-hero-mobile-title-line='1']",
        { opacity: [0.2, 1], y: ['110%', '0%'] },
        { delay: 0.3, duration: 0.72, ease: heroEntranceEase },
      ),
      animate(
        "[data-hero-mobile-title-line='2']",
        { opacity: [0.2, 1], y: ['110%', '0%'] },
        { delay: 0.4, duration: 0.72, ease: heroEntranceEase },
      ),
      animate(
        "[data-hero-compact-title-line='0']",
        { opacity: [0.2, 1], y: ['110%', '0%'] },
        { delay: 0.2, duration: 0.64, ease: heroEntranceEase },
      ),
      animate(
        "[data-hero-compact-title-line='1']",
        { opacity: [0.2, 1], y: ['110%', '0%'] },
        { delay: 0.28, duration: 0.64, ease: heroEntranceEase },
      ),
      animate(
        "[data-hero-compact-title-line='2']",
        { opacity: [0.2, 1], y: ['110%', '0%'] },
        { delay: 0.36, duration: 0.64, ease: heroEntranceEase },
      ),
      animate(
        "[data-hero-compact-title-line='3']",
        { opacity: [0.2, 1], y: ['110%', '0%'] },
        { delay: 0.44, duration: 0.64, ease: heroEntranceEase },
      ),
      animate(
        '[data-hero-description]',
        { opacity: [0, 1], y: [20, 0] },
        { delay: 0.56, duration: 0.65, ease: heroEntranceEase },
      ),
      animate(
        '[data-hero-tech-list]',
        { opacity: [0, 1], y: [14, 0] },
        { delay: 0.67, duration: 0.52, ease: heroEntranceEase },
      ),
      animate(
        '[data-hero-actions]',
        { opacity: [0, 1], y: [14, 0] },
        { delay: 0.78, duration: 0.52, ease: heroEntranceEase },
      ),
      animate(
        '[data-hero-availability]',
        { opacity: [0, 1], y: [12, 0] },
        { delay: 0.88, duration: 0.5, ease: heroEntranceEase },
      ),
    ];

    return () => {
      controls.forEach((control) => {
        control.stop();
      });
    };
  }, [animate, prefersReducedMotion]);

  return (
    <div className="hero-content" ref={scope}>
      <p className="hero-eyebrow" data-hero-eyebrow>
        {content.eyebrow}
      </p>
      <p className="hero-greeting" data-hero-greeting>
        {content.greeting}
      </p>
      <HeroHeading
        compactTitleLines={content.compactTitleLines}
        mobileTitleLines={content.mobileTitleLines}
        title={content.title}
        titleLines={content.titleLines}
      />
      <p className="hero-description" data-hero-description>
        {content.description}
      </p>
      <HeroTechList technologies={content.technologies} />
      <HeroActions
        primaryAction={content.primaryAction}
        secondaryAction={content.secondaryAction}
      />
      <HeroAvailability availability={content.availability} />
    </div>
  );
}
