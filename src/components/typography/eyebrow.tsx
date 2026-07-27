import type { ComponentPropsWithoutRef } from 'react';

import { cn } from '@/lib/utils';

export type EyebrowProps = ComponentPropsWithoutRef<'span'> & {
  readonly number?: string;
};

export function Eyebrow({
  children,
  className,
  number,
  ...props
}: EyebrowProps): React.JSX.Element {
  return (
    <span
      className={cn(
        'type-caption text-subtle inline-flex items-center gap-2 font-medium tracking-[0.04em]',
        className,
      )}
      {...props}
    >
      <span aria-hidden="true" className="bg-cyan size-1.5 rounded-full" />
      {number ? <span className="text-cyan font-mono">{number}</span> : null}
      {children ? <span>{children}</span> : null}
    </span>
  );
}
