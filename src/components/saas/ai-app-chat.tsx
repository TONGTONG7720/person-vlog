'use client';

import { Bot, FileText, LoaderCircle, Send } from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';

type AiAppChatMessage = Readonly<{
  readonly content: string;
  readonly role: 'assistant' | 'user';
}>;

type AiAppChatSource = Readonly<{
  readonly chunkIndex: number;
  readonly documentId: string;
  readonly title: string;
}>;

type AiAppChatProps = Readonly<{
  readonly description: string;
  readonly disabled?: boolean;
  readonly endpoint: string | undefined;
  readonly heading: string;
  readonly placeholder: string;
}>;

export function AiAppChat({
  description,
  disabled = false,
  endpoint,
  heading,
  placeholder,
}: AiAppChatProps): React.JSX.Element {
  const [messages, setMessages] = useState<readonly AiAppChatMessage[]>([]);
  const [sources, setSources] = useState<readonly AiAppChatSource[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | undefined>();

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();

    if (endpoint === undefined || disabled) {
      return;
    }

    const formData = new FormData(event.currentTarget);
    const message = getFormValue(formData, 'message');

    if (message === '') {
      return;
    }

    event.currentTarget.reset();
    setIsSubmitting(true);
    setSources([]);
    setStatusMessage(undefined);
    setMessages((current) => [
      ...current,
      { content: message, role: 'user' },
      { content: '', role: 'assistant' },
    ]);

    try {
      const response = await fetch(endpoint, {
        body: JSON.stringify({ message }),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      });

      if (!response.ok || response.body === null) {
        const payload: unknown = await response.json().catch(() => ({}));
        setStatusMessage(isMessagePayload(payload) ? payload.message : 'AI 应用暂时不可用。');
        setMessages((current) => current.slice(0, -1));
        return;
      }

      await readAiAppEventStream(response.body, {
        onError(message) {
          setStatusMessage(message);
        },
        onSources(nextSources) {
          setSources(nextSources);
        },
        onToken(token) {
          setMessages((current) => {
            const latest = current.at(-1);

            if (latest === undefined || latest.role !== 'assistant') {
              return current;
            }

            return [
              ...current.slice(0, -1),
              { content: `${latest.content}${token}`, role: 'assistant' },
            ];
          });
        },
      });
    } catch (error) {
      setStatusMessage(
        error instanceof TypeError ? '网络连接不可用，请稍后重试。' : 'AI 回复中断，请稍后重试。',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section aria-labelledby="ai-app-chat-heading" className="ai-app-chat">
      <header>
        <div>
          <p className="saas-kicker">SANDBOX / RUNTIME</p>
          <h2 id="ai-app-chat-heading">{heading}</h2>
          <p>{description}</p>
        </div>
      </header>
      <div aria-live="polite" className="ai-app-chat-messages">
        {messages.length === 0 ? (
          <div className="ai-app-chat-empty">
            <Bot aria-hidden="true" size={24} />
            <p>
              {disabled
                ? '请先保存应用并进入测试或发布状态。'
                : '输入一个真实问题，验证当前应用的回答边界。'}
            </p>
          </div>
        ) : (
          messages.map((message, index) => (
            <article data-role={message.role} key={`${message.role}-${index}`}>
              <span>{message.role === 'assistant' ? 'AI' : '你'}</span>
              <p>{message.content === '' && isSubmitting ? '正在思考…' : message.content}</p>
            </article>
          ))
        )}
      </div>
      <div className="ai-app-chat-sources">
        <div>
          <FileText aria-hidden="true" size={15} />
          <span>回答来源</span>
        </div>
        {sources.length === 0 ? (
          <p>完成回答后会显示当前回答使用的已授权资料。</p>
        ) : (
          <ul>
            {sources.map((source) => (
              <li key={`${source.documentId}-${source.chunkIndex}`}>
                <span>{source.title}</span>
                <small>片段 {source.chunkIndex + 1}</small>
              </li>
            ))}
          </ul>
        )}
      </div>
      <form onSubmit={handleSubmit}>
        <label>
          <span className="visually-hidden">向 AI 应用输入问题</span>
          <textarea
            disabled={disabled || isSubmitting}
            name="message"
            placeholder={placeholder}
            required
            rows={3}
          />
        </label>
        <button className="saas-primary-button" disabled={disabled || isSubmitting} type="submit">
          {isSubmitting ? (
            <LoaderCircle aria-hidden="true" className="saas-inline-spinner" size={16} />
          ) : (
            <Send aria-hidden="true" size={16} />
          )}
          <span>{isSubmitting ? '正在回答…' : '发送问题'}</span>
        </button>
      </form>
      {statusMessage === undefined ? null : (
        <p className="saas-inline-feedback" role="alert">
          {statusMessage}
        </p>
      )}
    </section>
  );
}

async function readAiAppEventStream(
  stream: ReadableStream<Uint8Array>,
  handlers: Readonly<{
    readonly onError: (message: string) => void;
    readonly onSources: (sources: readonly AiAppChatSource[]) => void;
    readonly onToken: (token: string) => void;
  }>,
): Promise<void> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    for (;;) {
      const next = await reader.read();

      if (next.done) {
        break;
      }

      buffer += decoder.decode(next.value, { stream: true });
      const events = buffer.split(/\r?\n\r?\n/gu);
      buffer = events.pop() ?? '';

      for (const event of events) {
        handleAiAppEvent(event, handlers);
      }
    }

    if (buffer !== '') {
      handleAiAppEvent(buffer, handlers);
    }
  } finally {
    reader.releaseLock();
  }
}

function handleAiAppEvent(
  event: string,
  handlers: Readonly<{
    readonly onError: (message: string) => void;
    readonly onSources: (sources: readonly AiAppChatSource[]) => void;
    readonly onToken: (token: string) => void;
  }>,
): void {
  const eventName = event
    .split(/\r?\n/gu)
    .find((line) => line.startsWith('event:'))
    ?.slice('event:'.length)
    .trim();
  const data = event
    .split(/\r?\n/gu)
    .filter((line) => line.startsWith('data:'))
    .map((line) => line.slice('data:'.length).trim())
    .join('');

  if (data === '') {
    return;
  }

  try {
    const payload: unknown = JSON.parse(data);

    if (eventName === 'token' && isTokenPayload(payload)) {
      handlers.onToken(payload.value);
    }

    if (eventName === 'sources' && isSourcesPayload(payload)) {
      handlers.onSources(payload.sources);
    }

    if (eventName === 'error' && isMessagePayload(payload)) {
      handlers.onError(payload.message);
    }
  } catch {
    handlers.onError('AI 返回了无法读取的数据。');
  }
}

function getFormValue(formData: FormData, name: string): string {
  const value = formData.get(name);

  return typeof value === 'string' ? value.trim() : '';
}

function isMessagePayload(value: unknown): value is Readonly<{ readonly message: string }> {
  return (
    typeof value === 'object' &&
    value !== null &&
    'message' in value &&
    typeof value.message === 'string'
  );
}

function isSourcesPayload(
  value: unknown,
): value is Readonly<{ readonly sources: readonly AiAppChatSource[] }> {
  return (
    typeof value === 'object' &&
    value !== null &&
    'sources' in value &&
    Array.isArray(value.sources)
  );
}

function isTokenPayload(value: unknown): value is Readonly<{ readonly value: string }> {
  return (
    typeof value === 'object' &&
    value !== null &&
    'value' in value &&
    typeof value.value === 'string'
  );
}
