import type { ComponentPropsWithoutRef } from 'react';

import { cn } from '@/lib/utils';

type TagProps = ComponentPropsWithoutRef<'span'>;

export function Tag({ className, ...props }: TagProps): React.JSX.Element {
  return (
    <span
      className={cn(
        'border-border-subtle bg-raised text-muted inline-flex min-h-7 items-center rounded-full border px-3 text-xs font-medium',
        className,
      )}
      {...props}
    />
  );
}
