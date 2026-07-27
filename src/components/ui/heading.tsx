import { cva, type VariantProps } from 'class-variance-authority';
import type { ComponentPropsWithoutRef } from 'react';

import { cn } from '@/lib/utils';

const headingVariants = cva('font-display font-semibold tracking-[-0.01em] text-ink', {
  defaultVariants: {
    size: 'h2',
    tone: 'default',
  },
  variants: {
    size: {
      'display-lg': 'type-display-lg',
      'display-md': 'type-display-md',
      'display-xl': 'type-display-xl',
      h1: 'type-h1',
      h2: 'type-h2',
      h3: 'type-h3',
      h4: 'type-h4',
    },
    tone: {
      accent: 'text-cyan',
      default: 'text-ink',
      muted: 'text-muted',
    },
  },
});

type HeadingElement = 'h1' | 'h2' | 'h3' | 'h4';
type HeadingProps = ComponentPropsWithoutRef<'h1'> &
  VariantProps<typeof headingVariants> & {
    readonly as?: HeadingElement;
  };

export function Heading({
  as: Tag = 'h2',
  className,
  size,
  tone,
  ...props
}: HeadingProps): React.JSX.Element {
  return <Tag className={cn(headingVariants({ size, tone }), className)} {...props} />;
}
