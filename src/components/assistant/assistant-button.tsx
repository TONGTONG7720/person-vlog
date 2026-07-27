'use client';

import { MessageCircle, X } from 'lucide-react';
import { useTranslations } from 'next-intl';

type AssistantButtonProps = Readonly<{
  readonly isOpen: boolean;
  readonly onClick: () => void;
}>;

export function AssistantButton({ isOpen, onClick }: AssistantButtonProps): React.JSX.Element {
  const t = useTranslations('assistant');
  const label = isOpen ? t('close') : t('open');

  return (
    <button
      aria-expanded={isOpen}
      aria-label={label}
      className="assistant-launcher"
      onClick={onClick}
      type="button"
    >
      {isOpen ? (
        <X aria-hidden="true" className="size-5" strokeWidth={1.8} />
      ) : (
        <MessageCircle aria-hidden="true" className="size-5" strokeWidth={1.8} />
      )}
      <span aria-hidden="true" className="assistant-launcher-label">
        AI
      </span>
    </button>
  );
}
