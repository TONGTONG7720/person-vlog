import { CircleAlert } from 'lucide-react';
import type { TextareaHTMLAttributes } from 'react';
import type { FieldError, UseFormRegisterReturn } from 'react-hook-form';

import { cn } from '@/lib/utils';

export type TextareaFieldProps = Readonly<{
  readonly error?: FieldError | undefined;
  readonly id: string;
  readonly label: string;
  readonly registration: UseFormRegisterReturn;
}> &
  Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'id' | 'name'>;

export function TextareaField({
  className,
  error,
  id,
  label,
  registration,
  ...textareaProps
}: TextareaFieldProps): React.JSX.Element {
  const errorId = `${id}-error`;

  return (
    <div className="contact-field">
      <label className="contact-field-label" htmlFor={id}>
        {label}
      </label>
      <textarea
        aria-describedby={error === undefined ? undefined : errorId}
        aria-invalid={error === undefined ? undefined : true}
        className={cn('contact-control contact-textarea', className)}
        id={id}
        {...registration}
        {...textareaProps}
      />
      {error === undefined ? null : (
        <p className="contact-field-message contact-field-message-error" id={errorId} role="alert">
          <CircleAlert aria-hidden="true" size={15} strokeWidth={1.75} />
          <span>{error.message}</span>
        </p>
      )}
    </div>
  );
}
