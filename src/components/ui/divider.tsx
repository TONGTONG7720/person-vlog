import type { ComponentPropsWithoutRef } from 'react';

import { cn } from '@/lib/utils';

type DividerProps = ComponentPropsWithoutRef<'hr'>;

export function Divider({ className, ...props }: DividerProps): React.JSX.Element {
  return className ? (
    <hr className={cn('border-border-subtle border-0 border-t', className)} {...props} />
  ) : (
    <hr className="border-border-subtle border-0 border-t" {...props} />
  );
}
