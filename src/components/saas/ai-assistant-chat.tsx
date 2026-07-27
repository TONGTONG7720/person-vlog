'use client';

import { ArrowLeft, Bot, FileText, LoaderCircle, Send, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import type { FormEvent } from 'react';

import { buildSaasOrganizationHref } from '@/lib/saas-presentation';

type ChatMessage = Readonly<{
  readonly content: string;
  readonly role: 'assistant' | 'user';
}>;

type ChatSource = Readonly<{
  readonly chunkIndex: number;
  readonly documentId: string;
  readonly title: string;
}>;

type AiAssistantChatProps = Readonly<{
  readonly assistantId: string;
  readonly description: string | null;
  readonly model: string;
  readonly name: string;
  readonly organizationSlug: string;
  readonly workspaceName: string;
}>;

export function AiAssistantChat({
  assistantId,
  description,
  model,
  name,
  organizationSlug,
  workspaceName,
}: AiAssistantChatProps): React.JSX.Element {
  const [messages, setMessages] = useState<readonly ChatMessage[]>([]);
  const [sources, setSources] = useState<readonly ChatSource[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | undefined>();

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
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
      const response = await fetch(
        `/api/v1/ai/chat?organization=${encodeURIComponent(organizationSlug)}`,
        {
          body: JSON.stringify({ assistantId, message }),
          headers: { 'Content-Type': 'application/json' },
          method: 'POST',
        },
      );

      if (!response.ok || response.body === null) {
        const payload: unknown = await response.json().catch(() => ({}));
        setStatusMessage(isMessagePayload(payload) ? payload.message : 'AI 助手暂时不可用。');
        setMessages((current) => current.slice(0, -1));
        return;
      }

      await readAiEventStream(response.body, {
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
    <section aria-labelledby="ai-chat-heading" className="saas-ai-chat-shell">
      <header className="saas-ai-chat-header">
        <div>
          <Link
            className="saas-ai-back-link"
            href={buildSaasOrganizationHref('/dashboard/ai', organizationSlug)}
          >
            <ArrowLeft aria-hidden="true" size={16} />
            <span>返回 AI Platform</span>
          </Link>
          <p className="saas-kicker">{workspaceName.toLocaleUpperCase('en-US')} / ASSISTANT</p>
          <h1 id="ai-chat-heading">{name}</h1>
          <p>{description ?? '仅根据当前已授权资料回答，并在答案后提供可核验的来源。'}</p>
        </div>
        <div className="saas-ai-chat-model">
          <ShieldCheck aria-hidden="true" size={17} />
          <span>{model}</span>
          <small>组织隔离已启用</small>
        </div>
      </header>

      <div aria-live="polite" className="saas-ai-message-list">
        {messages.length === 0 ? (
          <div className="saas-ai-chat-empty">
            <Bot aria-hidden="true" size={26} strokeWidth={1.5} />
            <p>开始提问。助手不会读取其他企业、其他工作区、系统提示词或密钥。</p>
          </div>
        ) : (
          messages.map((message, index) => (
            <article
              className="saas-ai-message"
              data-role={message.role}
              key={`${message.role}-${index}`}
            >
              <span>{message.role === 'assistant' ? 'AI' : '你'}</span>
              <p>{message.content === '' && isSubmitting ? '正在思考…' : message.content}</p>
            </article>
          ))
        )}
      </div>

      <section aria-labelledby="ai-sources-heading" className="saas-ai-source-panel">
        <div>
          <p className="saas-kicker">SOURCES</p>
          <h2 id="ai-sources-heading">回答来源</h2>
        </div>
        {sources.length === 0 ? (
          <p>完成回答后，会显示当前回答使用的资料来源。</p>
        ) : (
          <ul>
            {sources.map((source) => (
              <li key={`${source.documentId}-${source.chunkIndex}`}>
                <FileText aria-hidden="true" size={16} />
                <span>{source.title}</span>
                <small>片段 {source.chunkIndex + 1}</small>
              </li>
            ))}
          </ul>
        )}
      </section>

      <form className="saas-ai-chat-form" onSubmit={handleSubmit}>
        <label>
          <span className="visually-hidden">向企业 AI 助手提问</span>
          <textarea
            disabled={isSubmitting}
            name="message"
            placeholder="例如：员工入职流程需要哪些材料？"
            required
            rows={3}
          />
        </label>
        <button className="saas-primary-button" disabled={isSubmitting} type="submit">
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

async function readAiEventStream(
  stream: ReadableStream<Uint8Array>,
  handlers: Readonly<{
    readonly onSources: (sources: readonly ChatSource[]) => void;
    readonly onToken: (token: string) => void;
  }>,
): Promise<void> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    for (;;) {
      const result = await reader.read();

      if (result.done) {
        break;
      }

      buffer += decoder.decode(result.value, { stream: true });
      const events = buffer.split(/\r?\n\r?\n/gu);
      buffer = events.pop() ?? '';

      for (const event of events) {
        handleAiEvent(event, handlers);
      }
    }

    if (buffer !== '') {
      handleAiEvent(buffer, handlers);
    }
  } finally {
    reader.releaseLock();
  }
}

function handleAiEvent(
  event: string,
  handlers: Readonly<{
    readonly onSources: (sources: readonly ChatSource[]) => void;
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
  } catch {
    // The stream is untrusted input; an invalid event is ignored rather than rendered.
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
): value is Readonly<{ readonly sources: readonly ChatSource[] }> {
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
