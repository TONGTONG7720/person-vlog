'use client';

import type { ReactNode } from 'react';

import { Link } from '@/i18n/navigation';
import { trackContentConversion } from '@/lib/analytics';
import type { ContentConversionTarget } from '@/types/analytics';

type ContentConversionLinkProps = Readonly<{
  readonly children: ReactNode;
  readonly className?: string;
  readonly href: string;
  readonly slug: string;
  readonly target: ContentConversionTarget;
  readonly targetId?: string;
}>;

export function ContentConversionLink({
  children,
  className,
  href,
  slug,
  target,
  targetId,
}: ContentConversionLinkProps): React.JSX.Element {
  return (
    <Link
      className={className}
      href={href}
      onClick={() => trackContentConversion(slug, target, targetId)}
    >
      {children}
    </Link>
  );
}
