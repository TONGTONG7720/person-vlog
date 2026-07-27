'use client';

import { ArrowUp, LoaderCircle } from 'lucide-react';
import type { FormEvent, KeyboardEvent } from 'react';

type ChatInputProps = Readonly<{
  readonly disabled: boolean;
  readonly inputHint: string;
  readonly inputId: string;
  readonly inputLabel: string;
  readonly onChange: (value: string) => void;
  readonly onSubmit: () => void;
  readonly placeholder: string;
  readonly sendLabel: string;
  readonly value: string;
}>;

export function ChatInput({
  disabled,
  inputHint,
  inputId,
  inputLabel,
  onChange,
  onSubmit,
  placeholder,
  sendLabel,
  value,
}: ChatInputProps): React.JSX.Element {
  const canSubmit = value.trim().length > 0 && !disabled;

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();

    if (canSubmit) {
      onSubmit();
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>): void => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();

      if (canSubmit) {
        onSubmit();
      }
    }
  };

  return (
    <form className="assistant-input" onSubmit={handleSubmit}>
      <label htmlFor={inputId}>{inputLabel}</label>
      <div className="assistant-input-control">
        <textarea
          disabled={disabled}
          id={inputId}
          maxLength={2_000}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={1}
          value={value}
        />
        <button aria-label={sendLabel} disabled={!canSubmit} type="submit">
          {disabled ? (
            <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
          ) : (
            <ArrowUp aria-hidden="true" className="size-4" />
          )}
        </button>
      </div>
      <p>{inputHint}</p>
    </form>
  );
}
