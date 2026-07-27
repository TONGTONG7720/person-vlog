'use client';

import { LoaderCircle, Play, ShieldAlert } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { FormEvent } from 'react';
import { useState } from 'react';

type AiTaskComposerProps = Readonly<{
  readonly canRun: boolean;
  readonly organizationSlug: string;
  readonly workspaces: readonly Readonly<{ readonly id: string; readonly name: string }>[];
}>;

export function AiTaskComposer({
  canRun,
  organizationSlug,
  workspaces,
}: AiTaskComposerProps): React.JSX.Element {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | undefined>();

  async function submitTask(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    setIsSubmitting(true);
    setStatusMessage(undefined);

    try {
      const response = await fetch(
        `/api/v1/agent/run?organization=${encodeURIComponent(organizationSlug)}`,
        {
          body: JSON.stringify({
            request: String(formData.get('request') ?? ''),
            workspaceId: String(formData.get('workspaceId') ?? ''),
          }),
          headers: { 'Content-Type': 'application/json' },
          method: 'POST',
        },
      );
      const payload = await readResponsePayload(response);

      if (!response.ok) {
        setStatusMessage(getResponseMessage(payload) ?? '任务未能提交，请检查权限和 Workspace。');
        return;
      }

      form.reset();
      setStatusMessage(
        response.status === 202
          ? '任务已进入人工审批队列，尚未执行任何业务写入。'
          : 'AIOS 已生成一份可复核的任务摘要。',
      );
      router.refresh();
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

  if (!canRun) {
    return (
      <section aria-labelledby="aios-task-composer-heading" className="aios-task-composer">
        <div className="aios-panel-heading">
          <div>
            <p className="saas-kicker">RUN TASK</p>
            <h2 id="aios-task-composer-heading">发起 AIOS 任务</h2>
          </div>
        </div>
        <p className="aios-access-notice">
          <ShieldAlert aria-hidden="true" size={18} />
          当前成员没有发起 AI 任务的权限，请联系企业管理员。
        </p>
      </section>
    );
  }

  return (
    <section aria-labelledby="aios-task-composer-heading" className="aios-task-composer">
      <div className="aios-panel-heading">
        <div>
          <p className="saas-kicker">RUN TASK</p>
          <h2 id="aios-task-composer-heading">从一个可复核的问题开始</h2>
        </div>
        <p>分析和知识任务会生成摘要；项目写入类请求先进入人工审批。</p>
      </div>
      {workspaces.length === 0 ? (
        <p className="saas-empty-state">请先在 AI Platform 中创建一个 Workspace，再发起任务。</p>
      ) : (
        <form className="aios-task-form" onSubmit={submitTask}>
          <label>
            <span>企业 AI Workspace</span>
            <select autoComplete="off" defaultValue="" name="workspaceId" required>
              <option disabled value="">
                选择一个 Workspace
              </option>
              {workspaces.map((workspace) => (
                <option key={workspace.id} value={workspace.id}>
                  {workspace.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>你希望 AI 帮你完成什么？</span>
            <textarea
              minLength={6}
              name="request"
              placeholder="例如：分析本月收入趋势，并给出需要关注的风险…"
              required
              rows={5}
              autoComplete="off"
            />
          </label>
          <button className="saas-primary-button" disabled={isSubmitting} type="submit">
            {isSubmitting ? (
              <LoaderCircle aria-hidden="true" className="saas-inline-spinner" size={16} />
            ) : (
              <Play aria-hidden="true" size={16} />
            )}
            <span>{isSubmitting ? '正在提交…' : '运行 AIOS 任务'}</span>
          </button>
        </form>
      )}
      {statusMessage === undefined ? null : (
        <p aria-live="polite" className="saas-inline-feedback" role="status">
          {statusMessage}
        </p>
      )}
    </section>
  );
}

async function readResponsePayload(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch (error) {
    if (error instanceof SyntaxError) {
      return undefined;
    }

    throw error;
  }
}

function getResponseMessage(payload: unknown): string | undefined {
  if (typeof payload !== 'object' || payload === null || !('message' in payload)) {
    return undefined;
  }

  return typeof payload.message === 'string' ? payload.message : undefined;
}
