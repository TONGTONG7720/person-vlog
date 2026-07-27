'use client';

import { useTranslations } from 'next-intl';

import { Link } from '@/i18n/navigation';
import { trackContactClick } from '@/lib/analytics';
import type { ChatMessage as ChatMessageType } from '@/types/chat';

type ChatMessageProps = Readonly<{
  readonly isStreaming?: boolean;
  readonly message: ChatMessageType;
}>;

function ThinkingIndicator(): React.JSX.Element {
  const t = useTranslations('assistant');

  return (
    <span aria-label={t('thinking')} className="assistant-thinking" role="status">
      <span />
      <span />
      <span />
    </span>
  );
}

export function ChatMessage({ isStreaming = false, message }: ChatMessageProps): React.JSX.Element {
  const t = useTranslations('assistant');
  const isAssistant = message.role === 'assistant';
  const hasContent = message.content.trim().length > 0;

  return (
    <article
      aria-label={isAssistant ? t('assistantResponse') : t('userQuestion')}
      className={
        isAssistant
          ? 'assistant-message assistant-message-assistant'
          : 'assistant-message assistant-message-user'
      }
    >
      {hasContent ? <p>{message.content}</p> : isStreaming ? <ThinkingIndicator /> : null}
      {isAssistant && message.links !== undefined && message.links.length > 0 ? (
        <nav aria-label={t('relatedPages')} className="assistant-message-links">
          <span>{t('relatedPages')}</span>
          <ul>
            {message.links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => {
                    if (link.href.startsWith('/contact')) {
                      trackContactClick('ai');
                    }
                  }}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </article>
  );
}
