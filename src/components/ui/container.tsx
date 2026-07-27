import { cva, type VariantProps } from 'class-variance-authority';
import type { ComponentPropsWithoutRef } from 'react';

import { cn } from '@/lib/utils';

const containerVariants = cva('mx-auto w-full', {
  defaultVariants: {
    size: 'content',
  },
  variants: {
    size: {
      content: 'max-w-[var(--container-content-max)] px-5 sm:px-8 xl:px-12',
      full: 'max-w-none px-5 sm:px-8 xl:px-12',
      narrow: 'max-w-[var(--container-narrow-max)] px-5 sm:px-8',
      text: 'max-w-[var(--container-text-max)] px-5 sm:px-0',
      wide: 'max-w-[var(--container-wide-max)] px-5 sm:px-8 xl:px-12',
    },
  },
});

export type ContainerSize = NonNullable<VariantProps<typeof containerVariants>['size']>;

export type ContainerProps = ComponentPropsWithoutRef<'div'> &
  VariantProps<typeof containerVariants>;

export function Container({ className, size, ...props }: ContainerProps): React.JSX.Element {
  return <div className={cn(containerVariants({ size }), className)} {...props} />;
}
