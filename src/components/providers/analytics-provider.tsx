'use client';

import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import { useEffect, useSyncExternalStore, type PropsWithChildren } from 'react';

import {
  isAnalyticsEnabled,
  trackArticleRead,
  trackPageView,
  trackProjectView,
} from '@/lib/analytics';

const VercelAnalytics = dynamic(
  () => import('@vercel/analytics/next').then((module) => module.Analytics),
  { ssr: false },
);

function subscribeToAnalyticsAvailability(): () => void {
  return () => undefined;
}

function getServerAnalyticsAvailability(): boolean {
  return false;
}

function getDynamicRouteSegment(pathname: string, prefix: string): string | undefined {
  if (!pathname.startsWith(prefix)) {
    return undefined;
  }

  const segment = pathname.slice(prefix.length);

  return segment.length > 0 && !segment.includes('/') ? segment : undefined;
}

function getLocaleAgnosticPath(pathname: string): string {
  if (pathname === '/en') {
    return '/';
  }

  return pathname.startsWith('/en/') ? pathname.slice(3) : pathname;
}

export function AnalyticsProvider({ children }: PropsWithChildren): React.JSX.Element {
  const pathname = usePathname();
  const shouldTrack = useSyncExternalStore(
    subscribeToAnalyticsAvailability,
    isAnalyticsEnabled,
    getServerAnalyticsAvailability,
  );

  useEffect(() => {
    if (!shouldTrack) {
      return;
    }

    if (pathname.startsWith('/admin')) {
      return;
    }

    trackPageView(pathname);

    const contentPathname = getLocaleAgnosticPath(pathname);
    const projectSlug = getDynamicRouteSegment(contentPathname, '/projects/');
    const articleSlug = getDynamicRouteSegment(contentPathname, '/blog/');

    if (projectSlug !== undefined) {
      trackProjectView(projectSlug, pathname);
    }

    if (articleSlug !== undefined) {
      trackArticleRead(articleSlug, pathname);
    }
  }, [pathname, shouldTrack]);

  return (
    <>
      {children}
      {shouldTrack ? (
        <VercelAnalytics beforeSend={(event) => (event.url.includes('/admin') ? null : event)} />
      ) : null}
    </>
  );
}
