'use client';

import { Download, FileText, LoaderCircle, Plus, Upload } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { FormEvent } from 'react';
import { useState } from 'react';

import type { PortalDocument } from '@/components/saas/types';
import { buildSaasOrganizationHref } from '@/lib/saas-presentation';

type ProjectFilePanelProps = Readonly<{
  readonly documents: readonly PortalDocument[];
  readonly organizationSlug: string;
  readonly projectId: string;
}>;

export function ProjectFilePanel({
  documents,
  organizationSlug,
  projectId,
}: ProjectFilePanelProps): React.JSX.Element {
  const router = useRouter();
  const [isSavingDocument, setIsSavingDocument] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | undefined>();
  const documentEndpoint = `/api/v1/projects/${projectId}/documents?organization=${encodeURIComponent(organizationSlug)}`;
  const fileEndpoint = `/api/v1/projects/${projectId}/files?organization=${encodeURIComponent(organizationSlug)}`;

  async function handleCreateDocument(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    setIsSavingDocument(true);
    setStatusMessage(undefined);

    try {
      const response = await fetch(documentEndpoint, {
        body: JSON.stringify({
          content: String(formData.get('content') ?? ''),
          title: String(formData.get('title') ?? ''),
        }),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      });

      if (!response.ok) {
        setStatusMessage('无法保存 Markdown 文档，请检查项目权限。');
        return;
      }

      form.reset();
      setStatusMessage('Markdown 文档已保存并进入当前项目知识库。');
      router.refresh();
    } catch (error) {
      if (error instanceof TypeError) {
        setStatusMessage('网络连接不可用，请稍后重试。');
        return;
      }

      throw error;
    } finally {
      setIsSavingDocument(false);
    }
  }

  async function handleUpload(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    setIsUploading(true);
    setStatusMessage(undefined);

    try {
      const response = await fetch(fileEndpoint, { body: formData, method: 'POST' });

      if (!response.ok) {
        setStatusMessage('无法上传文件。请确认格式、大小和私有存储配置。');
        return;
      }

      form.reset();
      setStatusMessage('文件已上传到当前组织的私有项目空间。');
      router.refresh();
    } catch (error) {
      if (error instanceof TypeError) {
        setStatusMessage('网络连接不可用，请稍后重试。');
        return;
      }

      throw error;
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <section aria-labelledby="project-files-heading" className="saas-workspace-panel">
      <div className="saas-panel-heading">
        <div>
          <p className="saas-kicker">DOCUMENTS</p>
          <h2 id="project-files-heading">交付文档与私有文件</h2>
        </div>
        <p>文件不会产生公开 URL；下载始终经过企业成员权限校验。</p>
      </div>
      <div className="saas-file-workbench">
        <form className="saas-upload-form" onSubmit={handleUpload}>
          <label>
            <span>上传项目文件</span>
            <input
              accept=".avif,.docx,.jpeg,.jpg,.md,.pdf,.png,.pptx,.txt,.webp,.zip"
              name="file"
              required
              type="file"
            />
          </label>
          <p>支持图片、PDF、Office 文档、Markdown 与 ZIP，单个文件不超过 20 MB。</p>
          <button className="saas-secondary-button" disabled={isUploading} type="submit">
            {isUploading ? (
              <LoaderCircle aria-hidden="true" className="saas-inline-spinner" size={16} />
            ) : (
              <Upload aria-hidden="true" size={16} />
            )}
            <span>{isUploading ? '上传中' : '上传私有文件'}</span>
          </button>
        </form>
        <form className="saas-markdown-form" onSubmit={handleCreateDocument}>
          <label>
            <span>Markdown 文档标题</span>
            <input name="title" placeholder="例如：本周交付说明" required type="text" />
          </label>
          <label>
            <span>内容</span>
            <textarea
              name="content"
              placeholder="# 本周更新\n\n记录需要客户确认的事项。"
              required
              rows={6}
            />
          </label>
          <button className="saas-secondary-button" disabled={isSavingDocument} type="submit">
            {isSavingDocument ? (
              <LoaderCircle aria-hidden="true" className="saas-inline-spinner" size={16} />
            ) : (
              <Plus aria-hidden="true" size={16} />
            )}
            <span>{isSavingDocument ? '保存中' : '创建 Markdown 文档'}</span>
          </button>
        </form>
      </div>
      {statusMessage === undefined ? null : (
        <p aria-live="polite" className="saas-inline-feedback" role="status">
          {statusMessage}
        </p>
      )}
      <div className="saas-document-list">
        {documents.length === 0 ? (
          <p className="saas-empty-state">当前项目还没有文档或文件。</p>
        ) : (
          documents.map((document) => (
            <article className="saas-document-row" key={document.id}>
              <FileText aria-hidden="true" size={18} strokeWidth={1.75} />
              <div>
                <strong>{document.title}</strong>
                <span>
                  {document.kind === 'MARKDOWN'
                    ? 'Markdown 文档'
                    : (document.contentType ?? '私有文件')}
                </span>
                {document.content === null ? null : (
                  <details>
                    <summary>查看内容</summary>
                    <pre>{document.content}</pre>
                  </details>
                )}
              </div>
              {document.pathname === null ? null : (
                <a
                  aria-label={`下载文件：${document.title}`}
                  className="saas-icon-button"
                  href={buildSaasOrganizationHref(
                    `/api/v1/projects/${projectId}/files/${document.id}`,
                    organizationSlug,
                  )}
                >
                  <Download aria-hidden="true" size={17} />
                </a>
              )}
            </article>
          ))
        )}
      </div>
    </section>
  );
}
