import { CircleAlert } from 'lucide-react';
import type { InputHTMLAttributes } from 'react';
import type { FieldError, UseFormRegisterReturn } from 'react-hook-form';

import { cn } from '@/lib/utils';

export type ContactFieldProps = Readonly<{
  readonly error?: FieldError | undefined;
  readonly id: string;
  readonly label: string;
  readonly registration: UseFormRegisterReturn;
}> &
  Omit<InputHTMLAttributes<HTMLInputElement>, 'id' | 'name'>;

export function ContactField({
  className,
  error,
  id,
  label,
  registration,
  ...inputProps
}: ContactFieldProps): React.JSX.Element {
  const errorId = `${id}-error`;

  return (
    <div className="contact-field">
      <label className="contact-field-label" htmlFor={id}>
        {label}
      </label>
      <input
        aria-describedby={error === undefined ? undefined : errorId}
        aria-invalid={error === undefined ? undefined : true}
        className={cn('contact-control', className)}
        id={id}
        {...registration}
        {...inputProps}
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
