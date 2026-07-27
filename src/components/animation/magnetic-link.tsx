'use client';

import type { MouseEvent, PointerEvent, ReactNode } from 'react';

import { useMotionPreference } from '@/components/providers/motion-provider';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';

const maxMagneticOffset = 4;

export type MagneticLinkProps = Readonly<{
  children: ReactNode;
  className?: string;
  href: string;
  onClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
}>;

export function MagneticLink({
  children,
  className,
  href,
  onClick,
}: MagneticLinkProps): React.JSX.Element {
  const prefersReducedMotion = useMotionPreference();

  const handlePointerMove = (event: PointerEvent<HTMLAnchorElement>): void => {
    if (prefersReducedMotion || event.pointerType !== 'mouse') {
      return;
    }

    const bounds = event.currentTarget.getBoundingClientRect();
    const offsetX = ((event.clientX - bounds.left) / bounds.width - 0.5) * maxMagneticOffset * 2;
    const offsetY = ((event.clientY - bounds.top) / bounds.height - 0.5) * maxMagneticOffset * 2;

    event.currentTarget.style.setProperty('--magnetic-x', `${offsetX.toFixed(2)}px`);
    event.currentTarget.style.setProperty('--magnetic-y', `${offsetY.toFixed(2)}px`);
  };

  const handlePointerLeave = (event: PointerEvent<HTMLAnchorElement>): void => {
    event.currentTarget.style.removeProperty('--magnetic-x');
    event.currentTarget.style.removeProperty('--magnetic-y');
  };

  return (
    <Link
      className={cn(className, 'magnetic-link')}
      href={href}
      {...(onClick === undefined ? {} : { onClick })}
      onPointerLeave={handlePointerLeave}
      onPointerMove={handlePointerMove}
    >
      {children}
    </Link>
  );
}
