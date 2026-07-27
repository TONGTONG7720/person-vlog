import { CircleAlert } from 'lucide-react';
import type { FieldError, UseFormRegisterReturn } from 'react-hook-form';

import type { ContactBudget, ContactSelectOption, ContactTimeline } from '@/types/contact';

type ContactOptionalSelectOption = ContactSelectOption<ContactBudget | ContactTimeline>;

export type BudgetSelectProps = Readonly<{
  readonly error?: FieldError | undefined;
  readonly id: string;
  readonly label: string;
  readonly options: readonly ContactOptionalSelectOption[];
  readonly placeholder: string;
  readonly registration: UseFormRegisterReturn;
}>;

export function BudgetSelect({
  error,
  id,
  label,
  options,
  placeholder,
  registration,
}: BudgetSelectProps): React.JSX.Element {
  const errorId = `${id}-error`;

  return (
    <div className="contact-field">
      <label className="contact-field-label" htmlFor={id}>
        {label}
      </label>
      <select
        aria-describedby={error === undefined ? undefined : errorId}
        aria-invalid={error === undefined ? undefined : true}
        className="contact-control contact-select"
        id={id}
        {...registration}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error === undefined ? null : (
        <p className="contact-field-message contact-field-message-error" id={errorId} role="alert">
          <CircleAlert aria-hidden="true" size={15} strokeWidth={1.75} />
          <span>{error.message}</span>
        </p>
      )}
    </div>
  );
}
