import { GitBranch, LockKeyhole } from 'lucide-react';

type AiWorkflowCanvasProps = Readonly<{
  readonly workflow?: Readonly<{
    readonly name: string;
    readonly nodeLabels: readonly string[];
    readonly workspaceName: string;
  }>;
}>;

const fallbackNodes = ['触发任务', '规划 Agent', '知识工具', '人工审批', '可复核报告'];

export function AiWorkflowCanvas({ workflow }: AiWorkflowCanvasProps): React.JSX.Element {
  const nodes = workflow?.nodeLabels.length ? workflow.nodeLabels : fallbackNodes;

  return (
    <section aria-labelledby="aios-workflow-heading" className="aios-workflow-canvas">
      <div className="aios-panel-heading">
        <div>
          <p className="saas-kicker">WORKFLOW</p>
          <h2 id="aios-workflow-heading">{workflow?.name ?? '企业 AI 任务处理'}</h2>
        </div>
        <p>
          <LockKeyhole aria-hidden="true" size={15} />
          只读执行图 · {workflow?.workspaceName ?? '选择 Workspace 后自动初始化'}
        </p>
      </div>
      <ol aria-label="AIOS 工作流步骤" className="aios-workflow-nodes">
        {nodes.map((node, index) => (
          <li key={`${node}-${index}`}>
            <span aria-hidden="true">{index + 1}</span>
            <strong>{node}</strong>
            {index === nodes.length - 1 ? null : <GitBranch aria-hidden="true" size={16} />}
          </li>
        ))}
      </ol>
    </section>
  );
}
