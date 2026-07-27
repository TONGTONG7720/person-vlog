'use client';

import {
  Bot,
  Braces,
  FileText,
  KeyRound,
  LoaderCircle,
  Plus,
  ShieldCheck,
  Sparkles,
  Upload,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { FormEvent } from 'react';
import { useState } from 'react';

import { buildSaasOrganizationHref, formatSaasDate } from '@/lib/saas-presentation';

type AiDashboardAssistant = Readonly<{
  readonly enabled: boolean;
  readonly id: string;
  readonly model: string;
  readonly name: string;
  readonly slug: string;
  readonly updatedAt: string;
}>;

type AiDashboardWorkspace = Readonly<{
  readonly assistantCount: number;
  readonly assistants: readonly AiDashboardAssistant[];
  readonly description: string | null;
  readonly documentCount: number;
  readonly id: string;
  readonly name: string;
  readonly slug: string;
}>;

type AiDashboardDocument = Readonly<{
  readonly chunkCount: number;
  readonly id: string;
  readonly permissionKeys: readonly string[];
  readonly status: 'FAILED' | 'PROCESSING' | 'READY' | 'SECURITY_REVIEW' | 'UPLOADING';
  readonly title: string;
  readonly updatedAt: string;
  readonly workspaceId: string;
}>;

type AiDashboardTemplate = Readonly<{
  readonly category: string;
  readonly description: string;
  readonly id: string;
  readonly name: string;
}>;

type AiDashboardApiKey = Readonly<{
  readonly createdAt: string;
  readonly expiresAt: string | null;
  readonly id: string;
  readonly lastUsedAt: string | null;
  readonly name: string;
  readonly prefix: string;
  readonly revokedAt: string | null;
  readonly scopes: readonly string[];
}>;

type AiPlatformDashboardProps = Readonly<{
  readonly apiKeys: readonly AiDashboardApiKey[];
  readonly canManage: boolean;
  readonly documents: readonly AiDashboardDocument[];
  readonly organizationSlug: string;
  readonly templates: readonly AiDashboardTemplate[];
  readonly usage: Readonly<{
    readonly costMicros: number;
    readonly requestCount: number;
    readonly tokenCount: number;
  }>;
  readonly workspaces: readonly AiDashboardWorkspace[];
}>;

type RequestState =
  | Readonly<{ readonly kind: 'idle' }>
  | Readonly<{ readonly kind: 'loading'; readonly message: string }>
  | Readonly<{ readonly kind: 'error' | 'success'; readonly message: string }>;

export function AiPlatformDashboard({
  apiKeys,
  canManage,
  documents,
  organizationSlug,
  templates,
  usage,
  workspaces,
}: AiPlatformDashboardProps): React.JSX.Element {
  const router = useRouter();
  const [requestState, setRequestState] = useState<RequestState>({ kind: 'idle' });
  const [issuedApiKey, setIssuedApiKey] = useState<string | undefined>();
  const hasWorkspace = workspaces.length > 0;
  const requestSuffix = `?organization=${encodeURIComponent(organizationSlug)}`;
  const assistants = workspaces.flatMap((workspace) => workspace.assistants);

  async function refreshAfterRequest(message: string): Promise<void> {
    setRequestState({ kind: 'success', message });
    router.refresh();
  }

  async function handleWorkspaceSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setRequestState({ kind: 'loading', message: '正在创建 AI Workspace…' });

    try {
      await requestJson(`/api/v1/ai/workspaces${requestSuffix}`, {
        body: JSON.stringify({
          description: getFormValue(formData, 'description') || undefined,
          name: getFormValue(formData, 'name'),
          slug: getFormValue(formData, 'slug'),
        }),
        method: 'POST',
      });
      event.currentTarget.reset();
      await refreshAfterRequest('AI Workspace 已创建。现在可以创建助手并导入资料。');
    } catch (error) {
      setRequestState({ kind: 'error', message: getErrorMessage(error) });
    }
  }

  async function handleAssistantSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setRequestState({ kind: 'loading', message: '正在发布 AI 助手…' });

    try {
      await requestJson(`/api/v1/ai/assistants${requestSuffix}`, {
        body: JSON.stringify({
          description: getFormValue(formData, 'description') || undefined,
          model: getFormValue(formData, 'model'),
          name: getFormValue(formData, 'name'),
          slug: getFormValue(formData, 'slug'),
          systemPrompt: getFormValue(formData, 'systemPrompt') || undefined,
          templateId: getFormValue(formData, 'templateId') || undefined,
          workspaceId: getFormValue(formData, 'workspaceId'),
        }),
        method: 'POST',
      });
      event.currentTarget.reset();
      await refreshAfterRequest('AI 助手已发布。');
    } catch (error) {
      setRequestState({ kind: 'error', message: getErrorMessage(error) });
    }
  }

  async function handleTextDocumentSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setRequestState({ kind: 'loading', message: '正在创建并处理知识文档…' });

    try {
      const result = await requestJson<{ readonly document: Readonly<{ readonly id: string }> }>(
        `/api/v1/ai/documents${requestSuffix}`,
        {
          body: JSON.stringify({
            content: getFormValue(formData, 'content'),
            sourceType: getFormValue(formData, 'sourceType'),
            title: getFormValue(formData, 'title'),
            workspaceId: getFormValue(formData, 'workspaceId'),
          }),
          method: 'POST',
        },
      );
      await requestJson(`/api/v1/ai/documents/${result.document.id}/process${requestSuffix}`, {
        method: 'POST',
      });
      event.currentTarget.reset();
      await refreshAfterRequest('知识文档已进入可检索状态。');
    } catch (error) {
      setRequestState({ kind: 'error', message: getErrorMessage(error) });
    }
  }

  async function handleFileDocumentSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setRequestState({ kind: 'loading', message: '正在上传并处理文件…' });

    try {
      const result = await requestJson<{ readonly document: Readonly<{ readonly id: string }> }>(
        `/api/v1/ai/documents${requestSuffix}`,
        { body: formData, method: 'POST' },
      );
      await requestJson(`/api/v1/ai/documents/${result.document.id}/process${requestSuffix}`, {
        method: 'POST',
      });
      event.currentTarget.reset();
      await refreshAfterRequest('文件已处理完成；状态和分块数量已更新。');
    } catch (error) {
      setRequestState({ kind: 'error', message: getErrorMessage(error) });
    }
  }

  async function handleApiKeySubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setRequestState({ kind: 'loading', message: '正在签发 API Key…' });
    setIssuedApiKey(undefined);

    try {
      const result = await requestJson<{ readonly apiKey: Readonly<{ readonly secret: string }> }>(
        `/api/v1/ai/api-keys${requestSuffix}`,
        { body: JSON.stringify({ name: getFormValue(formData, 'name') }), method: 'POST' },
      );
      setIssuedApiKey(result.apiKey.secret);
      event.currentTarget.reset();
      await refreshAfterRequest('API Key 已签发，请立即复制保存；刷新后不会再次显示。');
    } catch (error) {
      setRequestState({ kind: 'error', message: getErrorMessage(error) });
    }
  }

  async function rotateApiKey(apiKeyId: string): Promise<void> {
    setRequestState({ kind: 'loading', message: '正在轮换 API Key…' });
    setIssuedApiKey(undefined);

    try {
      const result = await requestJson<{ readonly apiKey: Readonly<{ readonly secret: string }> }>(
        `/api/v1/ai/api-keys/${apiKeyId}/rotate${requestSuffix}`,
        { method: 'POST' },
      );
      setIssuedApiKey(result.apiKey.secret);
      await refreshAfterRequest('API Key 已轮换；旧 Key 已立即撤销，请复制保存新 Key。');
    } catch (error) {
      setRequestState({ kind: 'error', message: getErrorMessage(error) });
    }
  }

  async function disableApiKey(apiKeyId: string): Promise<void> {
    setRequestState({ kind: 'loading', message: '正在禁用 API Key…' });

    try {
      await requestJson(`/api/v1/ai/api-keys/${apiKeyId}/disable${requestSuffix}`, {
        method: 'POST',
      });
      await refreshAfterRequest('API Key 已禁用。');
    } catch (error) {
      setRequestState({ kind: 'error', message: getErrorMessage(error) });
    }
  }

  async function deleteApiKey(apiKeyId: string): Promise<void> {
    setRequestState({ kind: 'loading', message: '正在删除 API Key…' });

    try {
      await requestJson(`/api/v1/ai/api-keys/${apiKeyId}${requestSuffix}`, { method: 'DELETE' });
      await refreshAfterRequest('API Key 已删除。');
    } catch (error) {
      setRequestState({ kind: 'error', message: getErrorMessage(error) });
    }
  }

  return (
    <div className="saas-ai-dashboard">
      <section aria-label="AI 使用概览" className="saas-ai-metric-grid">
        <article>
          <Bot aria-hidden="true" size={18} strokeWidth={1.75} />
          <span>助手</span>
          <strong>{assistants.length}</strong>
          <small>已发布 / 当前组织</small>
        </article>
        <article>
          <FileText aria-hidden="true" size={18} strokeWidth={1.75} />
          <span>知识文档</span>
          <strong>{documents.length}</strong>
          <small>按 Workspace 隔离</small>
        </article>
        <article>
          <Sparkles aria-hidden="true" size={18} strokeWidth={1.75} />
          <span>模型调用</span>
          <strong>{usage.requestCount.toLocaleString('zh-CN')}</strong>
          <small>{usage.tokenCount.toLocaleString('zh-CN')} Token 已记录</small>
        </article>
        <article>
          <KeyRound aria-hidden="true" size={18} strokeWidth={1.75} />
          <span>API Key</span>
          <strong>{apiKeys.filter((apiKey) => apiKey.revokedAt === null).length}</strong>
          <small>成本记录 ¥{(usage.costMicros / 1_000_000).toFixed(2)}</small>
        </article>
      </section>

      {requestState.kind === 'idle' ? null : (
        <p
          aria-live="polite"
          className={
            requestState.kind === 'error'
              ? 'saas-inline-feedback'
              : requestState.kind === 'success'
                ? 'saas-inline-feedback saas-feedback-success'
                : 'saas-inline-feedback'
          }
          role={requestState.kind === 'error' ? 'alert' : 'status'}
        >
          {requestState.kind === 'loading' ? (
            <LoaderCircle aria-hidden="true" className="saas-inline-spinner" size={16} />
          ) : null}
          {requestState.message}
        </p>
      )}

      <section
        aria-labelledby="ai-assistants-heading"
        className="saas-workspace-panel saas-ai-panel"
      >
        <div className="saas-panel-heading">
          <div>
            <p className="saas-kicker">AI ASSISTANTS</p>
            <h2 id="ai-assistants-heading">已发布的企业助手</h2>
          </div>
          <p>每个回答只检索当前组织、当前 AI Workspace 与当前成员角色已授权的资料。</p>
        </div>
        {assistants.length === 0 ? (
          <p className="saas-empty-state">
            先创建一个 AI Workspace，再从模板发布你的第一个企业助手。
          </p>
        ) : (
          <div className="saas-ai-assistant-grid">
            {workspaces.flatMap((workspace) =>
              workspace.assistants.map((assistant) => (
                <article className="saas-ai-assistant-card" key={assistant.id}>
                  <div>
                    <span
                      className="saas-ai-status"
                      data-status={assistant.enabled ? 'ready' : 'disabled'}
                    >
                      {assistant.enabled ? '已发布' : '已停用'}
                    </span>
                    <p>
                      {workspace.name} / {assistant.model}
                    </p>
                  </div>
                  <h3>{assistant.name}</h3>
                  <small>更新于 {formatSaasDate(assistant.updatedAt)}</small>
                  <Link
                    className="saas-secondary-button"
                    href={buildSaasOrganizationHref(
                      `/dashboard/ai/${assistant.id}`,
                      organizationSlug,
                    )}
                  >
                    <span>打开对话</span>
                    <Braces aria-hidden="true" size={16} />
                  </Link>
                </article>
              )),
            )}
          </div>
        )}
      </section>

      <section
        aria-labelledby="ai-knowledge-heading"
        className="saas-workspace-panel saas-ai-panel"
      >
        <div className="saas-panel-heading">
          <div>
            <p className="saas-kicker">KNOWLEDGE PIPELINE</p>
            <h2 id="ai-knowledge-heading">知识库与处理状态</h2>
          </div>
          <p>支持 PDF、DOCX、Markdown 与 TXT。上传后由独立处理任务解析、分块并写入向量数据域。</p>
        </div>
        <div className="saas-ai-document-layout">
          <ul className="saas-ai-document-list">
            {documents.length === 0 ? (
              <li className="saas-empty-state">
                还没有文档。资料处理完成后，助手会在回答中给出来源引用。
              </li>
            ) : (
              documents.map((document) => (
                <li key={document.id}>
                  <FileText aria-hidden="true" size={17} strokeWidth={1.75} />
                  <div>
                    <strong>{document.title}</strong>
                    <span>
                      {document.chunkCount} 个分块 · 更新于 {formatSaasDate(document.updatedAt)}
                    </span>
                    <small>
                      {document.permissionKeys.length === 0
                        ? '组织内默认可用'
                        : `授权角色：${document.permissionKeys.join(' / ')}`}
                    </small>
                  </div>
                  <span
                    className="saas-ai-status"
                    data-status={document.status.toLocaleLowerCase('en-US')}
                  >
                    {document.status === 'READY'
                      ? '可检索'
                      : document.status === 'FAILED'
                        ? '失败'
                        : document.status === 'SECURITY_REVIEW'
                          ? '安全复核中'
                          : '处理中'}
                  </span>
                </li>
              ))
            )}
          </ul>
          {!canManage ? null : (
            <div className="saas-ai-document-forms">
              <form className="saas-ai-inline-form" onSubmit={handleTextDocumentSubmit}>
                <h3>新增文本资料</h3>
                <label>
                  <span>AI Workspace</span>
                  <select
                    defaultValue={workspaces[0]?.id}
                    disabled={!hasWorkspace}
                    name="workspaceId"
                    required
                  >
                    {workspaces.map((workspace) => (
                      <option key={workspace.id} value={workspace.id}>
                        {workspace.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>标题</span>
                  <input
                    disabled={!hasWorkspace}
                    name="title"
                    placeholder="例如：员工手册 2026"
                    required
                  />
                </label>
                <label>
                  <span>格式</span>
                  <select defaultValue="MARKDOWN" disabled={!hasWorkspace} name="sourceType">
                    <option value="MARKDOWN">Markdown</option>
                    <option value="TEXT">纯文本</option>
                  </select>
                </label>
                <label>
                  <span>内容</span>
                  <textarea
                    disabled={!hasWorkspace}
                    name="content"
                    placeholder="粘贴可公开给该 Workspace 的资料…"
                    required
                    rows={5}
                  />
                </label>
                <button
                  className="saas-secondary-button"
                  disabled={!hasWorkspace || requestState.kind === 'loading'}
                  type="submit"
                >
                  <Plus aria-hidden="true" size={16} />
                  <span>处理文本资料</span>
                </button>
              </form>
              <form className="saas-ai-inline-form" onSubmit={handleFileDocumentSubmit}>
                <h3>上传文件</h3>
                <label>
                  <span>AI Workspace</span>
                  <select
                    defaultValue={workspaces[0]?.id}
                    disabled={!hasWorkspace}
                    name="workspaceId"
                    required
                  >
                    {workspaces.map((workspace) => (
                      <option key={workspace.id} value={workspace.id}>
                        {workspace.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>文件标题（可选）</span>
                  <input disabled={!hasWorkspace} name="title" placeholder="默认使用文件名" />
                </label>
                <label>
                  <span>PDF / DOCX / Markdown / TXT</span>
                  <input
                    accept=".pdf,.docx,.md,.txt,text/plain,text/markdown,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    disabled={!hasWorkspace}
                    name="file"
                    required
                    type="file"
                  />
                </label>
                <input name="chunkSize" type="hidden" value="800" readOnly />
                <input name="chunkOverlap" type="hidden" value="120" readOnly />
                <button
                  className="saas-secondary-button"
                  disabled={!hasWorkspace || requestState.kind === 'loading'}
                  type="submit"
                >
                  <Upload aria-hidden="true" size={16} />
                  <span>上传并处理</span>
                </button>
              </form>
            </div>
          )}
        </div>
      </section>

      {!canManage ? null : (
        <div className="saas-ai-management-grid">
          <section
            aria-labelledby="ai-workspace-create-heading"
            className="saas-workspace-panel saas-ai-panel"
          >
            <div className="saas-panel-heading">
              <div>
                <p className="saas-kicker">SETUP</p>
                <h2 id="ai-workspace-create-heading">创建 AI Workspace</h2>
              </div>
            </div>
            <form className="saas-ai-inline-form" onSubmit={handleWorkspaceSubmit}>
              <label>
                <span>名称</span>
                <input name="name" placeholder="例如：产品知识库" required />
              </label>
              <label>
                <span>标识</span>
                <input
                  name="slug"
                  pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
                  placeholder="product-knowledge"
                  required
                />
              </label>
              <label>
                <span>说明（可选）</span>
                <input name="description" placeholder="这个空间用于什么资料？" />
              </label>
              <button
                className="saas-primary-button"
                disabled={requestState.kind === 'loading'}
                type="submit"
              >
                <Plus aria-hidden="true" size={16} />
                <span>创建 Workspace</span>
              </button>
            </form>
          </section>

          <section
            aria-labelledby="ai-assistant-create-heading"
            className="saas-workspace-panel saas-ai-panel"
          >
            <div className="saas-panel-heading">
              <div>
                <p className="saas-kicker">AGENT BUILDER</p>
                <h2 id="ai-assistant-create-heading">发布 AI Assistant</h2>
              </div>
            </div>
            <form className="saas-ai-inline-form" onSubmit={handleAssistantSubmit}>
              <label>
                <span>AI Workspace</span>
                <select
                  defaultValue={workspaces[0]?.id}
                  disabled={!hasWorkspace}
                  name="workspaceId"
                  required
                >
                  {workspaces.map((workspace) => (
                    <option key={workspace.id} value={workspace.id}>
                      {workspace.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>模板</span>
                <select defaultValue="" disabled={!hasWorkspace} name="templateId">
                  <option value="">自定义 Prompt</option>
                  {templates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name} · {template.category}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>名称</span>
                <input
                  disabled={!hasWorkspace}
                  name="name"
                  placeholder="例如：产品问答助手"
                  required
                />
              </label>
              <label>
                <span>标识</span>
                <input
                  disabled={!hasWorkspace}
                  name="slug"
                  pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
                  placeholder="product-guide"
                  required
                />
              </label>
              <label>
                <span>模型 ID</span>
                <input
                  disabled={!hasWorkspace}
                  name="model"
                  placeholder="填写已在模型管理中启用的模型"
                  required
                />
              </label>
              <label>
                <span>系统提示词（可选）</span>
                <textarea
                  disabled={!hasWorkspace}
                  name="systemPrompt"
                  placeholder="选择模板后可保留为空；自定义时请写清回答边界。"
                  rows={4}
                />
              </label>
              <button
                className="saas-primary-button"
                disabled={!hasWorkspace || requestState.kind === 'loading'}
                type="submit"
              >
                <Sparkles aria-hidden="true" size={16} />
                <span>发布助手</span>
              </button>
            </form>
          </section>
        </div>
      )}

      {!canManage ? null : (
        <section aria-labelledby="ai-api-heading" className="saas-workspace-panel saas-ai-panel">
          <div className="saas-panel-heading">
            <div>
              <p className="saas-kicker">API ACCESS</p>
              <h2 id="ai-api-heading">企业系统接入</h2>
            </div>
            <p>
              API Key 只保存哈希；Key
              只会在创建时显示一次。接口会继续执行组织、套餐和知识库权限边界。
            </p>
          </div>
          <div className="saas-ai-api-layout">
            <form className="saas-ai-inline-form" onSubmit={handleApiKeySubmit}>
              <label>
                <span>Key 名称</span>
                <input name="name" placeholder="例如：客服系统生产环境" required />
              </label>
              <button
                className="saas-secondary-button"
                disabled={requestState.kind === 'loading'}
                type="submit"
              >
                <KeyRound aria-hidden="true" size={16} />
                <span>签发 API Key</span>
              </button>
              {issuedApiKey === undefined ? null : (
                <output className="saas-ai-secret">
                  <ShieldCheck aria-hidden="true" size={16} />
                  <code>{issuedApiKey}</code>
                </output>
              )}
            </form>
            <div className="saas-ai-api-list">
              <code>POST /api/v1/ai/chat</code>
              {apiKeys.length === 0 ? (
                <p>还没有签发 API Key。</p>
              ) : (
                apiKeys.map((apiKey) => (
                  <div key={apiKey.id}>
                    <strong>{apiKey.name}</strong>
                    <span>
                      {apiKey.prefix}… · {apiKey.revokedAt === null ? '可用' : '已撤销'}
                    </span>
                    <small>
                      {apiKey.lastUsedAt === null
                        ? '尚未使用'
                        : `最近使用 ${formatSaasDate(apiKey.lastUsedAt)}`}
                    </small>
                    <small>
                      scope：{apiKey.scopes.length === 0 ? '未授予' : apiKey.scopes.join(' / ')}
                    </small>
                    <small>
                      {apiKey.expiresAt === null
                        ? '不过期'
                        : `到期 ${formatSaasDate(apiKey.expiresAt)}`}
                    </small>
                    {apiKey.revokedAt === null ? (
                      <span className="saas-ai-api-actions">
                        <button
                          className="saas-secondary-button"
                          disabled={requestState.kind === 'loading'}
                          onClick={() => void rotateApiKey(apiKey.id)}
                          type="button"
                        >
                          <span>轮换 Key</span>
                        </button>
                        <button
                          className="saas-secondary-button"
                          disabled={requestState.kind === 'loading'}
                          onClick={() => void disableApiKey(apiKey.id)}
                          type="button"
                        >
                          <span>禁用</span>
                        </button>
                      </span>
                    ) : (
                      <button
                        className="saas-secondary-button"
                        disabled={requestState.kind === 'loading'}
                        onClick={() => void deleteApiKey(apiKey.id)}
                        type="button"
                      >
                        <span>删除</span>
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

async function requestJson<Result>(input: RequestInfo | URL, init: RequestInit): Promise<Result> {
  const headers = new Headers(init.headers);

  if (!(init.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(input, { ...init, headers });
  const payload: unknown = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = isMessagePayload(payload) ? payload.message : '请求暂时无法完成。';
    throw new Error(message);
  }

  return payload as Result;
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : '请求暂时无法完成。';
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
