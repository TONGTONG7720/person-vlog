'use client';

import { ArrowRight } from 'lucide-react';

import type { HeroAction } from '@/config/home';
import { buttonVariants } from '@/components/ui/button-variants';
import { Link } from '@/i18n/navigation';
import { trackContactClick } from '@/lib/analytics';
import { cn } from '@/lib/utils';

export type HeroActionsProps = Readonly<{
  primaryAction: HeroAction;
  secondaryAction: HeroAction;
}>;

type HeroActionLinkProps = Readonly<{
  action: HeroAction;
  variant: 'primary' | 'secondary';
}>;

function HeroActionLink({ action, variant }: HeroActionLinkProps): React.JSX.Element {
  return (
    <Link
      className={cn(buttonVariants({ size: 'lg', variant }), 'hero-action group')}
      href={action.href}
      onClick={() => {
        if (action.href.startsWith('/contact')) {
          trackContactClick('hero');
        }
      }}
    >
      <span>{action.label}</span>
      <ArrowRight aria-hidden="true" className="hero-action-icon size-4" />
    </Link>
  );
}

export function HeroActions({
  primaryAction,
  secondaryAction,
}: HeroActionsProps): React.JSX.Element {
  return (
    <div className="hero-actions" data-hero-actions>
      <HeroActionLink action={primaryAction} variant="primary" />
      <HeroActionLink action={secondaryAction} variant="secondary" />
    </div>
  );
}
