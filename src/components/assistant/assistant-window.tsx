'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';

import { getAssistantConfig, type AssistantConfig } from '@/config/assistant';
import { categorizeAssistantQuestion, trackAssistantUsage } from '@/lib/analytics';
import { ChatInput } from '@/components/assistant/chat-input';
import { ChatMessage as ChatMessageItem } from '@/components/assistant/chat-message';
import {
  assistantLinkSchema,
  chatSessionSchema,
  type AssistantLink,
  type ChatMessage,
} from '@/types/chat';

type AssistantWindowProps = Readonly<{
  readonly isOpen: boolean;
  readonly onOpenChange: (isOpen: boolean) => void;
}>;

function createMessage(
  role: ChatMessage['role'],
  content: string,
  links?: readonly AssistantLink[],
): ChatMessage {
  return {
    content,
    createdAt: Date.now(),
    id: crypto.randomUUID(),
    ...(links === undefined ? {} : { links }),
    role,
  };
}

function createWelcomeMessage(config: AssistantConfig): ChatMessage {
  return createMessage('assistant', config.welcomeMessage);
}

function parseAssistantLinks(value: string | null): readonly AssistantLink[] {
  if (value === null) {
    return [];
  }

  try {
    const parsed = assistantLinkSchema
      .array()
      .max(3)
      .safeParse(JSON.parse(decodeURIComponent(value)));

    return parsed.success ? parsed.data : [];
  } catch (error) {
    if (error instanceof DOMException || error instanceof SyntaxError) {
      return [];
    }

    throw error;
  }
}

function readStoredMessages(storageKey: string): readonly ChatMessage[] | undefined {
  try {
    const storedValue = window.sessionStorage.getItem(storageKey);

    if (storedValue === null) {
      return undefined;
    }

    const parsed = chatSessionSchema.safeParse(JSON.parse(storedValue));

    return parsed.success
      ? parsed.data.map((message) => ({
          content: message.content,
          createdAt: message.createdAt,
          id: message.id,
          ...(message.links === undefined ? {} : { links: message.links }),
          role: message.role,
        }))
      : undefined;
  } catch (error) {
    if (error instanceof DOMException || error instanceof SyntaxError) {
      return undefined;
    }

    throw error;
  }
}

function persistMessages(storageKey: string, messages: readonly ChatMessage[]): void {
  try {
    window.sessionStorage.setItem(storageKey, JSON.stringify(messages));
  } catch (error) {
    if (error instanceof DOMException) {
      return;
    }

    throw error;
  }
}

export function AssistantWindow({ isOpen, onOpenChange }: AssistantWindowProps): React.JSX.Element {
  const locale = useLocale() === 'en-US' ? 'en-US' : 'zh-CN';
  const t = useTranslations('assistant');
  const assistantConfig = getAssistantConfig(locale);
  const assistantFailureMessage = t('failure');
  const assistantFailureLinks = useMemo(
    () => [{ href: '/contact', label: t('failureLink') }] as const,
    [t],
  );
  const inputId = useId();
  const messagesRef = useRef<HTMLDivElement>(null);
  const scrollFrame = useRef<number | undefined>(undefined);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [messages, setMessages] = useState<readonly ChatMessage[]>(() => {
    const storedMessages = readStoredMessages(assistantConfig.storageKey);

    return storedMessages !== undefined && storedMessages.length > 0
      ? storedMessages
      : [createWelcomeMessage(assistantConfig)];
  });

  const scheduleScrollToLatest = useCallback((): void => {
    if (scrollFrame.current !== undefined) {
      return;
    }

    scrollFrame.current = window.requestAnimationFrame(() => {
      const container = messagesRef.current;

      if (container !== null) {
        container.scrollTop = container.scrollHeight;
      }

      scrollFrame.current = undefined;
    });
  }, []);

  useEffect(() => {
    persistMessages(assistantConfig.storageKey, messages);
  }, [assistantConfig.storageKey, messages]);

  useEffect(() => {
    if (isOpen) {
      scheduleScrollToLatest();
    }
  }, [isOpen, messages, scheduleScrollToLatest]);

  useEffect(() => {
    return () => {
      if (scrollFrame.current !== undefined) {
        window.cancelAnimationFrame(scrollFrame.current);
      }
    };
  }, []);

  const updateAssistantMessage = useCallback(
    (messageId: string, content: string, links?: readonly AssistantLink[]): void => {
      setMessages((currentMessages) =>
        currentMessages.map((message) =>
          message.id === messageId
            ? { ...message, content, ...(links === undefined ? {} : { links }) }
            : message,
        ),
      );
    },
    [],
  );

  const sendQuestion = useCallback(
    async (question: string): Promise<void> => {
      const trimmedQuestion = question.trim();

      if (trimmedQuestion === '' || isStreaming) {
        return;
      }

      const userMessage = createMessage('user', trimmedQuestion);
      const assistantMessage = createMessage('assistant', '');
      const conversation = [...messages, userMessage].slice(-8);

      setInput('');
      setIsStreaming(true);
      setMessages((currentMessages) => [...currentMessages, userMessage, assistantMessage]);
      trackAssistantUsage(categorizeAssistantQuestion(trimmedQuestion));

      try {
        const response = await fetch('/api/assistant', {
          body: JSON.stringify({
            locale,
            messages: conversation.map((message) => ({
              content: message.content,
              role: message.role,
            })),
          }),
          headers: { 'Content-Type': 'application/json' },
          method: 'POST',
        });

        if (!response.ok || response.body === null) {
          updateAssistantMessage(
            assistantMessage.id,
            assistantFailureMessage,
            assistantFailureLinks,
          );

          return;
        }

        const links = parseAssistantLinks(response.headers.get('x-assistant-links'));
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let content = '';

        try {
          while (true) {
            const nextChunk = await reader.read();

            if (nextChunk.done) {
              break;
            }

            content += decoder.decode(nextChunk.value, { stream: true });
            updateAssistantMessage(assistantMessage.id, content, links);
            scheduleScrollToLatest();
          }

          content += decoder.decode();
          updateAssistantMessage(
            assistantMessage.id,
            content.trim() === '' ? assistantFailureMessage : content,
            content.trim() === '' ? assistantFailureLinks : links,
          );
        } catch (error) {
          if (error instanceof DOMException || error instanceof TypeError) {
            updateAssistantMessage(
              assistantMessage.id,
              assistantFailureMessage,
              assistantFailureLinks,
            );
          } else {
            throw error;
          }
        } finally {
          reader.releaseLock();
        }
      } catch (error) {
        if (error instanceof DOMException || error instanceof TypeError) {
          updateAssistantMessage(
            assistantMessage.id,
            assistantFailureMessage,
            assistantFailureLinks,
          );
        } else {
          throw error;
        }
      } finally {
        setIsStreaming(false);
        scheduleScrollToLatest();
      }
    },
    [
      assistantFailureLinks,
      assistantFailureMessage,
      isStreaming,
      locale,
      messages,
      scheduleScrollToLatest,
      updateAssistantMessage,
    ],
  );

  const handleQuickAction = (prompt: string): void => {
    void sendQuestion(prompt);
  };

  return (
    <Dialog.Root onOpenChange={onOpenChange} open={isOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="assistant-dialog-overlay" />
        <Dialog.Content aria-describedby={`${inputId}-description`} className="assistant-window">
          <header className="assistant-window-header">
            <div>
              <Dialog.Title>{assistantConfig.name}</Dialog.Title>
              <Dialog.Description id={`${inputId}-description`}>
                {t('description')}
              </Dialog.Description>
            </div>
            <Dialog.Close aria-label={t('close')} className="assistant-close-button" type="button">
              <X aria-hidden="true" className="size-4" />
            </Dialog.Close>
          </header>

          <div
            aria-busy={isStreaming}
            aria-live="polite"
            className="assistant-messages"
            ref={messagesRef}
            role="log"
          >
            {messages.map((message) => (
              <ChatMessageItem
                isStreaming={isStreaming && message.content === ''}
                key={message.id}
                message={message}
              />
            ))}
          </div>

          <div aria-label={t('quickActions')} className="assistant-quick-actions" role="group">
            {assistantConfig.quickActions.map((action) => (
              <button
                disabled={isStreaming}
                key={action.label}
                onClick={() => handleQuickAction(action.prompt)}
                type="button"
              >
                {action.label}
              </button>
            ))}
          </div>

          <ChatInput
            disabled={isStreaming}
            inputId={inputId}
            inputHint={t('inputHint')}
            inputLabel={t('inputLabel')}
            onChange={setInput}
            onSubmit={() => void sendQuestion(input)}
            placeholder={t('placeholder')}
            sendLabel={t('send')}
            value={input}
          />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
