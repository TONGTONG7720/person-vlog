'use client';

import { forwardRef, type MouseEventHandler, type ReactNode } from 'react';

import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';

export type NavigationLinkProps = Readonly<{
  active?: boolean;
  children: ReactNode;
  className?: string;
  external?: boolean;
  href: string;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
}>;

export const NavigationLink = forwardRef<HTMLAnchorElement, NavigationLinkProps>(
  ({ active = false, children, className, external = false, href, onClick }, ref) => {
    const linkClassName = cn(
      'group text-muted relative inline-flex min-h-11 items-center gap-2 px-1 text-sm font-medium transition-colors duration-[var(--motion-fast)] hover:text-ink focus-visible:rounded-sm focus-visible:outline-offset-2',
      'after:bg-brand after:absolute after:inset-x-1 after:-bottom-0.5 after:h-px after:origin-left after:scale-x-0 after:transition-transform after:duration-[var(--motion-fast)] group-hover:after:scale-x-100',
      active ? 'text-ink after:scale-x-100' : undefined,
      className,
    );
    const clickHandler = onClick ? { onClick } : {};
    const content = (
      <>
        {children}
        {active ? <span aria-hidden="true" className="bg-cyan size-1.5 rounded-full" /> : null}
      </>
    );

    if (external) {
      return (
        <a
          aria-current={active ? 'page' : undefined}
          className={linkClassName}
          href={href}
          ref={ref}
          rel="noopener noreferrer"
          target="_blank"
          {...clickHandler}
        >
          {content}
        </a>
      );
    }

    return (
      <Link
        aria-current={active ? 'page' : undefined}
        className={linkClassName}
        href={href}
        ref={ref}
        {...clickHandler}
      >
        {content}
      </Link>
    );
  },
);

NavigationLink.displayName = 'NavigationLink';
