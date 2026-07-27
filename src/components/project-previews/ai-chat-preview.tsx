export function AiChatPreview(): React.JSX.Element {
  return (
    <div className="project-preview project-preview-chat" aria-hidden="true">
      <div className="project-preview-chat-header">
        <span className="project-preview-orb" />
        <span>业务助手</span>
        <span className="project-preview-chat-header-state">READY</span>
      </div>
      <div className="project-preview-conversation">
        <div className="project-preview-message is-user">
          <span className="project-preview-message-label">问题输入</span>
          <span className="project-preview-message-line" />
          <span className="project-preview-message-line short" />
        </div>
        <div className="project-preview-message is-assistant">
          <span className="project-preview-message-label">回答生成</span>
          <span className="project-preview-message-line" />
          <span className="project-preview-message-line" />
          <span className="project-preview-message-line medium" />
          <div className="project-preview-reference-row">
            <span>引用知识</span>
            <span className="project-preview-reference-pill" />
          </div>
        </div>
      </div>
      <div className="project-preview-composer">
        <span>继续输入问题</span>
        <span className="project-preview-send-mark">↗</span>
      </div>
    </div>
  );
}
