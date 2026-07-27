import { cva, type VariantProps } from 'class-variance-authority';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';

import { Container, type ContainerSize } from '@/components/ui/container';
import { cn } from '@/lib/utils';

const sectionVariants = cva('relative', {
  defaultVariants: {
    background: 'default',
    spacing: 'md',
  },
  variants: {
    background: {
      default: 'bg-canvas',
      elevated: 'bg-surface-1',
      secondary: 'bg-canvas-subtle',
    },
    spacing: {
      lg: 'py-[var(--section-space-lg)]',
      md: 'py-[var(--section-space-md)]',
      sm: 'py-[var(--section-space-sm)]',
      xl: 'py-[var(--section-space-xl)]',
    },
  },
});

export type SectionProps = Omit<ComponentPropsWithoutRef<'section'>, 'children'> &
  VariantProps<typeof sectionVariants> & {
    readonly ariaLabelledBy?: string;
    readonly children: ReactNode;
    readonly container?: ContainerSize | 'none';
  };

export function Section({
  ariaLabelledBy,
  background,
  children,
  className,
  container = 'none',
  spacing,
  ...props
}: SectionProps): React.JSX.Element {
  const content =
    container === 'none' ? children : <Container size={container}>{children}</Container>;

  return (
    <section
      aria-labelledby={ariaLabelledBy}
      className={cn(sectionVariants({ background, spacing }), className)}
      {...props}
    >
      {content}
    </section>
  );
}
