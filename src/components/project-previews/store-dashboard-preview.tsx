export function StoreDashboardPreview(): React.JSX.Element {
  return (
    <div className="project-preview project-preview-store" aria-hidden="true">
      <div className="project-preview-store-sidebar">
        <span className="project-preview-mark" />
        <span className="project-preview-sidebar-line is-active" />
        <span className="project-preview-sidebar-line" />
        <span className="project-preview-sidebar-line" />
        <span className="project-preview-sidebar-line" />
      </div>
      <div className="project-preview-store-main">
        <div className="project-preview-topbar">
          <span>运营视图</span>
          <span className="project-preview-status-light" />
        </div>
        <div className="project-preview-store-overview">
          <div className="project-preview-store-title-block">
            <span className="project-preview-overline">MULTI-STORE</span>
            <span className="project-preview-heading-line" />
          </div>
          <div className="project-preview-store-actions">
            <span />
            <span />
          </div>
        </div>
        <div className="project-preview-store-panels">
          <div className="project-preview-chart-panel">
            <span className="project-preview-panel-label">订单</span>
            <div className="project-preview-bars">
              <span />
              <span />
              <span />
              <span />
              <span />
              <span />
            </div>
          </div>
          <div className="project-preview-store-list">
            <span className="project-preview-panel-label">门店协作</span>
            <span />
            <span />
            <span />
          </div>
        </div>
      </div>
    </div>
  );
}
