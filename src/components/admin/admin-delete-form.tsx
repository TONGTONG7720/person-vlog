'use client';

import type { FormEvent } from 'react';

type AdminDeleteFormProps = Readonly<{
  readonly action: (formData: FormData) => Promise<void>;
  readonly id: string;
  readonly resourceLabel: string;
}>;

export function AdminDeleteForm({
  action,
  id,
  resourceLabel,
}: AdminDeleteFormProps): React.JSX.Element {
  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    if (!window.confirm(`确定要删除${resourceLabel}吗？此操作无法撤销。`)) {
      event.preventDefault();
    }
  }

  return (
    <form action={action} onSubmit={handleSubmit}>
      <input name="id" type="hidden" value={id} />
      <button className="admin-danger-button" type="submit">
        删除
      </button>
    </form>
  );
}
