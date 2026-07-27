import { cva } from 'class-variance-authority';

export const buttonVariants = cva(
  'transition-interaction inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm font-medium focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50',
  {
    defaultVariants: {
      size: 'md',
      variant: 'primary',
    },
    variants: {
      size: {
        sm: 'min-h-9 px-3 text-sm',
        md: 'min-h-[var(--button-md-height)] px-4 text-sm',
        lg: 'min-h-[var(--button-lg-height)] px-5 text-base',
      },
      variant: {
        primary: 'bg-brand text-ink hover:bg-brand-hover active:scale-[0.98]',
        secondary:
          'border border-border bg-transparent text-ink hover:bg-raised-hover active:scale-[0.98]',
        ghost: 'text-ink hover:bg-raised-hover active:scale-[0.98]',
        text: 'h-auto px-0 text-ink underline-offset-4 hover:text-cyan hover:underline',
      },
    },
  },
);
