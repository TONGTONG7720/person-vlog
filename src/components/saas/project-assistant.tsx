'use client';

import { BotMessageSquare, LoaderCircle, Send } from 'lucide-react';
import type { FormEvent } from 'react';
import { useState } from 'react';

type ProjectAssistantProps = Readonly<{
  readonly organizationSlug: string;
  readonly projectId: string;
}>;

export function ProjectAssistant({
  organizationSlug,
  projectId,
}: ProjectAssistantProps): React.JSX.Element {
  const [answer, setAnswer] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | undefined>();

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const question = String(formData.get('question') ?? '');
    setAnswer(undefined);
    setIsSubmitting(true);
    setStatusMessage(undefined);

    try {
      const response = await fetch(
        `/api/v1/projects/${projectId}/assistant?organization=${encodeURIComponent(organizationSlug)}`,
        {
          body: JSON.stringify({ question }),
          headers: { 'Content-Type': 'application/json' },
          method: 'POST',
        },
      );

      if (!response.ok || response.body === null) {
        setStatusMessage('项目助手暂时不可用。请先确认项目资料和模型服务是否已配置。');
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let nextAnswer = '';

      for (;;) {
        const result = await reader.read();

        if (result.done) {
          break;
        }

        nextAnswer += decoder.decode(result.value, { stream: true });
        setAnswer(nextAnswer);
      }

      setAnswer(`${nextAnswer}${decoder.decode()}`);
    } catch (error) {
      if (error instanceof TypeError) {
        setStatusMessage('网络连接不可用，请稍后重试。');
        return;
      }

      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section
      aria-labelledby="project-assistant-heading"
      className="saas-workspace-panel saas-assistant-panel"
    >
      <div className="saas-panel-heading">
        <div>
          <p className="saas-kicker">PROJECT AI</p>
          <h2 id="project-assistant-heading">项目助手</h2>
        </div>
        <p>仅检索当前组织、当前工作区与当前项目的 Markdown 资料。</p>
      </div>
      <form className="saas-assistant-form" onSubmit={handleSubmit}>
        <label>
          <span>向项目资料提问</span>
          <textarea
            name="question"
            placeholder="例如：本周需要客户确认哪些事项？"
            required
            rows={4}
          />
        </label>
        <button className="saas-primary-button" disabled={isSubmitting} type="submit">
          {isSubmitting ? (
            <LoaderCircle aria-hidden="true" className="saas-inline-spinner" size={16} />
          ) : (
            <Send aria-hidden="true" size={16} />
          )}
          <span>{isSubmitting ? '正在查询…' : '询问项目助手'}</span>
        </button>
      </form>
      {statusMessage === undefined ? null : (
        <p aria-live="polite" className="saas-inline-feedback" role="status">
          {statusMessage}
        </p>
      )}
      {answer === undefined ? (
        <div className="saas-assistant-empty">
          <BotMessageSquare aria-hidden="true" size={20} strokeWidth={1.5} />
          <p>项目助手不会读取其他企业、提示词或私密系统配置。</p>
        </div>
      ) : (
        <div aria-live="polite" className="saas-assistant-answer">
          <p>{answer}</p>
        </div>
      )}
    </section>
  );
}
