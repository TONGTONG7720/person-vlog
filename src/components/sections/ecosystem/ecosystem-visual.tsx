const systemStages = ['Repository', 'Modules', 'Systems', 'Products'] as const;
const activityNodes = ['PROJECT', 'CODE', 'BLOG', 'AI', 'SYSTEM'] as const;

export function EcosystemVisual(): React.JSX.Element {
  return (
    <div aria-hidden="true" className="ecosystem-visual">
      <p className="ecosystem-visual-label">CODE ACTIVITY MAP</p>
      <div className="ecosystem-system-flow">
        {systemStages.map((stage, index) => (
          <div className="ecosystem-system-stage" key={stage}>
            <span className="ecosystem-system-node">{stage}</span>
            {index === systemStages.length - 1 ? null : <span className="ecosystem-system-link" />}
          </div>
        ))}
      </div>
      <div className="ecosystem-activity-nodes">
        {activityNodes.map((node, index) => (
          <span
            className={`ecosystem-activity-node ecosystem-activity-node-${index + 1}`}
            key={node}
          >
            {node}
          </span>
        ))}
      </div>
    </div>
  );
}
