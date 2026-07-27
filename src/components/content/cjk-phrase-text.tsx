import { Children, type ReactNode } from 'react';

import { cjkNonBreakingPhrases } from '@/config/content';

const cjkPhraseSet = new Set<string>(cjkNonBreakingPhrases);
const cjkPhrasePattern = new RegExp(`(${cjkNonBreakingPhrases.join('|')})`, 'gu');

type CjkPhraseChildrenProps = Readonly<{
  readonly children: ReactNode;
}>;

type CjkPhraseTextProps = Readonly<{
  readonly text: string;
}>;

export function CjkPhraseChildren({ children }: CjkPhraseChildrenProps): ReactNode {
  return Children.map(children, (child) => {
    if (typeof child !== 'string') {
      return child;
    }

    return renderCjkPhrases(child);
  });
}

export function CjkPhraseText({ text }: CjkPhraseTextProps): ReactNode {
  return renderCjkPhrases(text);
}

function renderCjkPhrases(value: string): ReactNode {
  return value.split(cjkPhrasePattern).map((part, index) =>
    cjkPhraseSet.has(part) ? (
      <span className="cjk-keep-together" key={`${part}-${index}`}>
        {part}
      </span>
    ) : (
      part
    ),
  );
}
