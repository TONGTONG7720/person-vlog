import { isValidElement, type ReactNode } from 'react';
import rehypeHighlight from 'rehype-highlight';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { CodeBlock } from '@/components/content/code-block';
import { CjkPhraseChildren } from '@/components/content/cjk-phrase-text';
import { createMarkdownHeadingId } from '@/lib/markdown';

type MarkdownContentProps = Readonly<{
  readonly content: string;
}>;

export function MarkdownContent({ content }: MarkdownContentProps): React.JSX.Element {
  return (
    <div className="prose-content article-markdown">
      <ReactMarkdown
        components={{
          p: ({ children }) => (
            <p>
              <CjkPhraseChildren>{children}</CjkPhraseChildren>
            </p>
          ),
          h2: ({ children }) => (
            <h2 id={createMarkdownHeadingId(toPlainText(children))}>{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 id={createMarkdownHeadingId(toPlainText(children))}>{children}</h3>
          ),
          pre: ({ children }) => {
            const code = toPlainText(children);

            return (
              <CodeBlock code={code} language={getCodeLanguage(children)}>
                {children}
              </CodeBlock>
            );
          },
        }}
        rehypePlugins={[rehypeHighlight]}
        remarkPlugins={[remarkGfm]}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

function getCodeLanguage(value: ReactNode): string {
  if (!isValidElement<{ className?: string }>(value)) {
    return '';
  }

  const className = value.props.className ?? '';
  const match = /language-([a-z0-9+-]+)/iu.exec(className);

  return match?.[1] ?? '';
}

function toPlainText(value: ReactNode): string {
  if (typeof value === 'string' || typeof value === 'number') {
    return String(value);
  }

  if (Array.isArray(value)) {
    return value.map(toPlainText).join('');
  }

  if (isValidElement<{ children?: ReactNode }>(value)) {
    return toPlainText(value.props.children);
  }

  return '';
}
