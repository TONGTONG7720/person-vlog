'use client';

import { useEffect } from 'react';

import { isAnalyticsEnabled, trackArticleEngagement } from '@/lib/analytics';

export type ArticleEngagementTrackerProps = Readonly<{
  readonly slug: string;
}>;

function hasReachedArticleEnd(): boolean {
  const documentHeight = document.documentElement.scrollHeight;
  const viewportHeight = window.innerHeight;

  if (documentHeight <= viewportHeight + 80) {
    return false;
  }

  return window.scrollY + viewportHeight >= documentHeight * 0.9;
}

export function ArticleEngagementTracker({ slug }: ArticleEngagementTrackerProps): null {
  useEffect(() => {
    if (!isAnalyticsEnabled()) {
      return;
    }

    const startedAt = Date.now();
    let hasCompleted = hasReachedArticleEnd();
    let hasSent = false;

    const handleScroll = (): void => {
      hasCompleted ||= hasReachedArticleEnd();
    };

    const sendEngagement = (): void => {
      if (hasSent) {
        return;
      }

      hasSent = true;
      trackArticleEngagement(slug, (Date.now() - startedAt) / 1_000, hasCompleted);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('pagehide', sendEngagement, { once: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('pagehide', sendEngagement);
      sendEngagement();
    };
  }, [slug]);

  return null;
}
