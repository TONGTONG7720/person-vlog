export function DigitalDeliveryPreview(): React.JSX.Element {
  return (
    <div className="project-preview project-preview-delivery" aria-hidden="true">
      <div className="project-preview-delivery-header">
        <span>自动交付</span>
        <span className="project-preview-delivery-state">FLOW</span>
      </div>
      <div className="project-preview-delivery-flow">
        <div className="project-preview-flow-node is-complete">
          <span className="project-preview-flow-dot" />
          <span>订单确认</span>
        </div>
        <span className="project-preview-flow-line" />
        <div className="project-preview-flow-node is-current">
          <span className="project-preview-flow-dot" />
          <span>生成凭证</span>
        </div>
        <span className="project-preview-flow-line" />
        <div className="project-preview-flow-node">
          <span className="project-preview-flow-dot" />
          <span>交付通知</span>
        </div>
      </div>
      <div className="project-preview-delivery-cards">
        <div className="project-preview-delivery-card">
          <span className="project-preview-panel-label">订单队列</span>
          <span className="project-preview-delivery-card-line" />
          <span className="project-preview-delivery-card-line short" />
        </div>
        <div className="project-preview-delivery-card is-accent">
          <span className="project-preview-panel-label">交付节点</span>
          <span className="project-preview-delivery-card-line" />
          <span className="project-preview-delivery-card-line medium" />
        </div>
      </div>
    </div>
  );
}
