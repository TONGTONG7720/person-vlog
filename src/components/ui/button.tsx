'use client';

import type { VariantProps } from 'class-variance-authority';
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';

import { cn } from '@/lib/utils';

import { buttonVariants } from '@/components/ui/button-variants';

export { buttonVariants } from '@/components/ui/button-variants';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    readonly icon?: ReactNode;
    readonly iconPosition?: 'start' | 'end';
    readonly loading?: boolean;
  };

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className,
      disabled,
      icon,
      iconPosition = 'start',
      loading = false,
      size,
      type = 'button',
      variant,
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        aria-busy={loading}
        className={cn(buttonVariants({ size, variant }), className)}
        disabled={isDisabled}
        ref={ref}
        type={type}
        {...props}
      >
        {loading ? (
          <span
            aria-hidden="true"
            className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
          />
        ) : null}
        {!loading && iconPosition === 'start' ? icon : null}
        <span>{children}</span>
        {!loading && iconPosition === 'end' ? icon : null}
      </button>
    );
  },
);

Button.displayName = 'Button';
