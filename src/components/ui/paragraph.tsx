import { cva, type VariantProps } from 'class-variance-authority';
import type { ComponentPropsWithoutRef } from 'react';

import { cn } from '@/lib/utils';

const paragraphVariants = cva('', {
  defaultVariants: {
    size: 'md',
    tone: 'secondary',
  },
  variants: {
    size: {
      lg: 'type-body-lg',
      md: 'type-body-md',
      sm: 'type-body-sm',
    },
    tone: {
      primary: 'text-ink',
      secondary: 'text-muted',
      tertiary: 'text-subtle',
    },
  },
});

type ParagraphProps = ComponentPropsWithoutRef<'p'> & VariantProps<typeof paragraphVariants>;

export function Paragraph({ className, size, tone, ...props }: ParagraphProps): React.JSX.Element {
  return <p className={cn(paragraphVariants({ size, tone }), className)} {...props} />;
}
