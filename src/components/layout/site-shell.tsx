'use client';

import { usePathname } from 'next/navigation';
import type { PropsWithChildren } from 'react';

import { PageTransition } from '@/components/animation/page-transition';
import { AssistantLauncher } from '@/components/assistant/assistant-launcher';
import { SiteFooter } from '@/components/layout/site-footer';
import { SiteHeader } from '@/components/navigation/site-header';
import { PwaInstallButton } from '@/components/pwa/install-button';
import { SkipLink } from '@/components/ui/skip-link';

export function SiteShell({ children }: PropsWithChildren): React.JSX.Element {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith('/admin');
  const isWorkspaceRoute = pathname.startsWith('/client') || pathname.startsWith('/dashboard');
  const hasPrivateWorkspaceChrome = isAdminRoute || isWorkspaceRoute;

  return (
    <>
      <SkipLink />
      {hasPrivateWorkspaceChrome ? null : <SiteHeader />}
      <main className="min-h-[100dvh]" id="main-content" tabIndex={-1}>
        <PageTransition>{children}</PageTransition>
      </main>
      {hasPrivateWorkspaceChrome ? null : <SiteFooter />}
      {hasPrivateWorkspaceChrome ? null : <PwaInstallButton />}
      {hasPrivateWorkspaceChrome ? null : <AssistantLauncher />}
      <div aria-live="polite" className="sr-only" id="toast-region" />
    </>
  );
}
