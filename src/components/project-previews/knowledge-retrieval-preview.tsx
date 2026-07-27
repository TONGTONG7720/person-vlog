export function KnowledgeRetrievalPreview(): React.JSX.Element {
  return (
    <div className="project-preview project-preview-knowledge" aria-hidden="true">
      <div className="project-preview-knowledge-header">
        <span>知识检索</span>
        <span className="project-preview-knowledge-chip">RAG</span>
      </div>
      <div className="project-preview-search-field">
        <span className="project-preview-search-icon" />
        <span>检索企业知识</span>
      </div>
      <div className="project-preview-knowledge-layout">
        <div className="project-preview-document-list">
          <span className="project-preview-panel-label">来源文档</span>
          <span className="project-preview-document-row is-selected" />
          <span className="project-preview-document-row" />
          <span className="project-preview-document-row" />
          <span className="project-preview-document-row" />
        </div>
        <div className="project-preview-answer-panel">
          <span className="project-preview-panel-label">检索结果</span>
          <span className="project-preview-answer-line" />
          <span className="project-preview-answer-line" />
          <span className="project-preview-answer-line short" />
          <div className="project-preview-source-stack">
            <span />
            <span />
            <span />
          </div>
        </div>
      </div>
    </div>
  );
}
