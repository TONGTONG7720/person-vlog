'use client';

import { useState } from 'react';

import { contentCategories, type ContentCategory } from '@/config/content';
import { contentWriterOperations, type ContentWriterOperation } from '@/ai/prompts/content';

const contentWriterOperationLabels: Readonly<Record<ContentWriterOperation, string>> = {
  seo: '生成 SEO 信息',
  social: '改写社交草稿',
  summary: '优化文章摘要',
  tags: '推荐标签与关键词',
  title: '生成标题候选',
};

export function ContentAiAssistant(): React.JSX.Element {
  const [category, setCategory] = useState<ContentCategory>('backend');
  const [content, setContent] = useState('');
  const [description, setDescription] = useState('');
  const [keywords, setKeywords] = useState('');
  const [operation, setOperation] = useState<ContentWriterOperation>('summary');
  const [result, setResult] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const title = formData.get('articleTitle');

    if (typeof title !== 'string' || title.trim() === '') {
      setStatus('error');

      return;
    }

    setStatus('loading');
    setResult('');

    try {
      const response = await fetch('/api/admin/content-ai', {
        body: JSON.stringify({
          category,
          content,
          description,
          keywords: keywords
            .split(',')
            .map((keyword) => keyword.trim())
            .filter((keyword) => keyword !== ''),
          operation,
          title: title.trim(),
        }),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      });

      if (!response.ok || response.body === null) {
        setStatus('error');

        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let nextResult = '';

      while (true) {
        const chunk = await reader.read();

        if (chunk.done) {
          break;
        }

        nextResult += decoder.decode(chunk.value, { stream: true });
        setResult(nextResult);
      }

      nextResult += decoder.decode();
      setResult(nextResult);
      setStatus('idle');
    } catch {
      setStatus('error');
    }
  }

  async function copyResult(): Promise<void> {
    try {
      await navigator.clipboard.writeText(result);
    } catch {
      setStatus('error');
    }
  }

  return (
    <section aria-labelledby="content-ai-title" className="content-ai-workbench">
      <div>
        <p className="admin-kicker">EDITORIAL ASSISTANT</p>
        <h2 id="content-ai-title">AI 写作辅助</h2>
        <p>生成的是可复制的编辑草稿；它不会自动写入文章、不会自动发布，也不会替你编造案例。</p>
      </div>
      <form className="content-ai-form" onSubmit={handleSubmit}>
        <label>
          文章题目
          <input name="articleTitle" placeholder="例如：企业知识库检索链路设计" required />
        </label>
        <div className="admin-field-grid">
          <label>
            分类
            <select
              onChange={(event) => setCategory(event.target.value as ContentCategory)}
              value={category}
            >
              {contentCategories.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            辅助类型
            <select
              onChange={(event) => setOperation(event.target.value as ContentWriterOperation)}
              value={operation}
            >
              {contentWriterOperations.map((item) => (
                <option key={item} value={item}>
                  {contentWriterOperationLabels[item]}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label>
          已知关键词（逗号分隔）
          <input onChange={(event) => setKeywords(event.target.value)} value={keywords} />
        </label>
        <label>
          已知摘要（可选）
          <textarea onChange={(event) => setDescription(event.target.value)} value={description} />
        </label>
        <label>
          正文素材（可选）
          <textarea
            className="admin-editor-field"
            onChange={(event) => setContent(event.target.value)}
            value={content}
          />
        </label>
        <button className="admin-primary-button" disabled={status === 'loading'} type="submit">
          {status === 'loading' ? '正在生成草稿…' : '生成编辑草稿'}
        </button>
      </form>
      {status === 'error' ? (
        <p className="admin-form-feedback" role="alert">
          生成失败，请稍后重试或继续手动编辑。
        </p>
      ) : null}
      {result === '' ? null : (
        <div className="content-ai-result">
          <div>
            <h3>编辑草稿</h3>
            <button className="admin-secondary-button" onClick={copyResult} type="button">
              复制草稿
            </button>
          </div>
          <pre>{result}</pre>
        </div>
      )}
    </section>
  );
}
