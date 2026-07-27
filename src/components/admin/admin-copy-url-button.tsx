'use client';

import { useState } from 'react';

type AdminCopyUrlButtonProps = Readonly<{
  readonly url: string;
}>;

export function AdminCopyUrlButton({ url }: AdminCopyUrlButtonProps): React.JSX.Element {
  const [isCopied, setIsCopied] = useState(false);

  async function copyUrl(): Promise<void> {
    await navigator.clipboard.writeText(url);
    setIsCopied(true);
    window.setTimeout(() => setIsCopied(false), 1600);
  }

  return (
    <button className="admin-secondary-button" onClick={() => void copyUrl()} type="button">
      {isCopied ? '已复制' : '复制 URL'}
    </button>
  );
}
