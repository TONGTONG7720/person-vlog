'use client';

import { LoaderCircle, Send, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

type PublishState =
  | Readonly<{ readonly kind: 'idle' }>
  | Readonly<{ readonly kind: 'loading' }>
  | Readonly<{ readonly kind: 'error'; readonly message: string }>;

type MarketplacePublishFormProps = Readonly<{
  readonly organizationSlug: string;
}>;

export function MarketplacePublishForm({
  organizationSlug,
}: MarketplacePublishFormProps): React.JSX.Element {
  const router = useRouter();
  const [type, setType] = useState('AGENT');
  const [state, setState] = useState<PublishState>({ kind: 'idle' });

  async function publishDraft(formData: FormData): Promise<void> {
    setState({ kind: 'loading' });
    const title = readText(formData, 'title');
    const description = readText(formData, 'description');
    const version = readText(formData, 'version');
    const prompt = readText(formData, 'prompt');
    const tools = readText(formData, 'tools')
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
    const payload = {
      category: readText(formData, 'category'),
      description,
      manifest:
        type === 'AGENT'
          ? { description, model: readText(formData, 'model'), name: title, prompt, tools, version }
          : { description, name: title, version },
      ...(type === 'PLUGIN'
        ? {
            plugin: {
              config: {},
              permissions: readText(formData, 'permissions')
                .split(',')
                .map((item) => item.trim())
                .filter(Boolean),
              type: readText(formData, 'pluginType'),
            },
          }
        : {}),
      slug: readText(formData, 'slug'),
      tags: readText(formData, 'tags')
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
      title,
      type,
      version,
    };

    try {
      const response = await fetch(
        `/api/v1/marketplace/items?organization=${encodeURIComponent(organizationSlug)}`,
        {
          body: JSON.stringify(payload),
          headers: { 'Content-Type': 'application/json' },
          method: 'POST',
          signal: AbortSignal.timeout(15_000),
        },
      );
      const result = await readResponse(response);

      if (!response.ok) {
        setState({ kind: 'error', message: result.message });

        return;
      }

      router.refresh();
      setState({ kind: 'idle' });
    } catch (error) {
      if (error instanceof DOMException || error instanceof TypeError) {
        setState({ kind: 'error', message: '发布服务暂时不可用，请稍后重试。' });

        return;
      }

      throw error;
    }
  }

  return (
    <section aria-labelledby="marketplace-publish-heading" className="marketplace-publish-panel">
      <div className="marketplace-panel-heading">
        <div>
          <p className="marketplace-kicker">PUBLISH / DRAFT</p>
          <h2 id="marketplace-publish-heading">创建一个可审核的发布包。</h2>
        </div>
        <Sparkles aria-hidden="true" size={22} strokeWidth={1.5} />
      </div>
      <p className="marketplace-panel-description">
        草稿不会公开。提交审核后，管理员会结合基础安全检查进行人工确认。
      </p>
      <form action={publishDraft} className="marketplace-publish-form">
        <label>
          <span>内容类型</span>
          <select name="type" onChange={(event) => setType(event.target.value)} value={type}>
            <option value="AGENT">AI Agent</option>
            <option value="WORKFLOW">Workflow</option>
            <option value="PROMPT">Prompt</option>
            <option value="TEMPLATE">Template</option>
            <option value="PLUGIN">Plugin</option>
          </select>
        </label>
        <label>
          <span>名称</span>
          <input maxLength={160} minLength={2} name="title" required />
        </label>
        <label>
          <span>Slug</span>
          <input maxLength={96} name="slug" pattern="[a-z0-9]+(-[a-z0-9]+)*" required />
        </label>
        <label>
          <span>分类</span>
          <input
            maxLength={80}
            minLength={2}
            name="category"
            placeholder="例如 Customer Service"
            required
          />
        </label>
        <label>
          <span>版本</span>
          <input defaultValue="v1" maxLength={32} name="version" required />
        </label>
        <label className="marketplace-publish-form-wide">
          <span>说明</span>
          <textarea maxLength={4000} minLength={10} name="description" required rows={3} />
        </label>
        <label className="marketplace-publish-form-wide">
          <span>标签（以逗号分隔）</span>
          <input maxLength={300} name="tags" placeholder="Customer Service, Enterprise" />
        </label>
        {type === 'AGENT' ? (
          <>
            <label>
              <span>模型</span>
              <input
                maxLength={160}
                minLength={2}
                name="model"
                placeholder="例如 gpt-5.6-luna"
                required
              />
            </label>
            <label>
              <span>声明工具（以逗号分隔）</span>
              <input maxLength={300} name="tools" placeholder="read_document, call_api" />
            </label>
            <label className="marketplace-publish-form-wide">
              <span>系统提示词</span>
              <textarea maxLength={8000} minLength={10} name="prompt" required rows={5} />
            </label>
          </>
        ) : null}
        {type === 'PLUGIN' ? (
          <>
            <label>
              <span>插件类型</span>
              <input maxLength={80} minLength={2} name="pluginType" required />
            </label>
            <label>
              <span>最小权限集</span>
              <input
                defaultValue="call_api"
                name="permissions"
                placeholder="read_document, call_api"
                required
              />
            </label>
          </>
        ) : null}
        <div className="marketplace-publish-submit marketplace-publish-form-wide">
          <button className="saas-primary-button" disabled={state.kind === 'loading'} type="submit">
            {state.kind === 'loading' ? (
              <LoaderCircle aria-hidden="true" className="saas-inline-spinner" size={16} />
            ) : (
              <Send aria-hidden="true" size={16} strokeWidth={1.75} />
            )}
            <span>{state.kind === 'loading' ? '正在创建草稿…' : '创建草稿'}</span>
          </button>
          {state.kind === 'error' ? <p role="alert">{state.message}</p> : null}
        </div>
      </form>
    </section>
  );
}

function readText(formData: FormData, key: string): string {
  const value = formData.get(key);

  return typeof value === 'string' ? value.trim() : '';
}

async function readResponse(response: Response): Promise<Readonly<{ readonly message: string }>> {
  try {
    const payload: unknown = await response.json();

    return typeof payload === 'object' && payload !== null && 'message' in payload
      ? { message: typeof payload.message === 'string' ? payload.message : '发布失败。' }
      : { message: '' };
  } catch (error) {
    if (error instanceof SyntaxError) {
      return { message: '发布服务返回了无法识别的响应。' };
    }

    throw error;
  }
}
