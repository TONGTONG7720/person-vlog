'use client';

import type { ReactNode } from 'react';
import { useLocale } from 'next-intl';
import { useState } from 'react';

type CodeBlockProps = Readonly<{
  readonly children: ReactNode;
  readonly code: string;
  readonly language: string;
}>;

export function CodeBlock({ children, code, language }: CodeBlockProps): React.JSX.Element {
  const locale = useLocale();
  const [isCopied, setIsCopied] = useState(false);
  const lineCount = Math.max(1, code.split('\n').length);

  async function copyCode(): Promise<void> {
    try {
      await navigator.clipboard.writeText(code);
      setIsCopied(true);
      window.setTimeout(() => setIsCopied(false), 1_600);
    } catch {
      setIsCopied(false);
    }
  }

  return (
    <div className="article-code-block">
      <div className="article-code-toolbar">
        <span>{language || 'text'}</span>
        <button onClick={copyCode} type="button">
          {isCopied
            ? locale === 'en-US'
              ? 'Copied'
              : '已复制'
            : locale === 'en-US'
              ? 'Copy code'
              : '复制代码'}
        </button>
      </div>
      <div className="article-code-body">
        <ol aria-hidden="true" className="article-code-lines">
          {Array.from({ length: lineCount }, (_, index) => (
            <li key={index} />
          ))}
        </ol>
        <pre>{children}</pre>
      </div>
    </div>
  );
}
