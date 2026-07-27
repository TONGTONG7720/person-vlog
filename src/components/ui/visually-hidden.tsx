import type { ComponentPropsWithoutRef } from 'react';

import { cn } from '@/lib/utils';

type VisuallyHiddenProps = ComponentPropsWithoutRef<'span'>;

export function VisuallyHidden({ className, ...props }: VisuallyHiddenProps): React.JSX.Element {
  return <span className={cn('sr-only', className)} {...props} />;
}
