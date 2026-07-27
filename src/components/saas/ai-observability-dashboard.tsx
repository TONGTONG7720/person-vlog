import { Activity, CircleCheck, Clock3, FileChartColumnIncreasing } from 'lucide-react';
import Link from 'next/link';

import { formatSaasDate } from '@/lib/saas-presentation';

type AiObservabilityDashboardProps = Readonly<{
  readonly organizationSlug: string;
  readonly overview: NonNullable<
    Awaited<
      ReturnType<
        typeof import('@/server/saas/ai-operating-system-overview').getAiOperatingSystemOverview
      >
    >
  >;
}>;

export function AiObservabilityDashboard({
  organizationSlug,
  overview,
}: AiObservabilityDashboardProps): React.JSX.Element {
  const pendingApprovalCount = overview.approvals.filter(
    (approval) => approval.status === 'PENDING',
  ).length;
  const activeTaskCount = overview.taskRuns.filter((task) =>
    ['QUEUED', 'RUNNING', 'AWAITING_APPROVAL'].includes(task.status),
  ).length;

  return (
    <div className="aios-observability">
      <section aria-label="AIOS 运行指标" className="aios-metric-grid">
        <Metric icon={Activity} label="近期任务" value={overview.taskRuns.length} />
        <Metric icon={Clock3} label="进行中或待审批" value={activeTaskCount} />
        <Metric
          icon={FileChartColumnIncreasing}
          label="模型调用记录"
          value={overview.usage.requestCount}
        />
        <Metric icon={CircleCheck} label="待审批" value={pendingApprovalCount} />
      </section>

      <div className="aios-detail-grid">
        <section
          aria-labelledby="aios-runs-heading"
          className="saas-workspace-panel aios-list-panel"
        >
          <div className="aios-panel-heading">
            <div>
              <p className="saas-kicker">TASK RUNS</p>
              <h2 id="aios-runs-heading">任务运行状态</h2>
            </div>
            <Link href={`/dashboard/ai-workspace?organization=${organizationSlug}`}>
              发起新任务
            </Link>
          </div>
          {overview.taskRuns.length === 0 ? (
            <p className="saas-empty-state">
              尚无任务运行记录。首个任务会在这里留下状态和审计路径。
            </p>
          ) : (
            <ul className="aios-run-list">
              {overview.taskRuns.map((task) => (
                <li key={task.id}>
                  <div>
                    <strong>{task.workflow?.name ?? '已删除工作流'}</strong>
                    <small>
                      {task.toolKey ?? '知识检索'} · {formatSaasDate(task.queuedAt.toISOString())}
                    </small>
                  </div>
                  <span data-status={task.status}>{formatTaskStatus(task.status)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section
          aria-labelledby="aios-usage-heading"
          className="saas-workspace-panel aios-list-panel"
        >
          <div className="aios-panel-heading">
            <div>
              <p className="saas-kicker">MODEL USAGE</p>
              <h2 id="aios-usage-heading">调用与成本记录</h2>
            </div>
          </div>
          <dl className="aios-definition-list">
            <div>
              <dt>调用次数</dt>
              <dd>{overview.usage.requestCount.toLocaleString('zh-CN')}</dd>
            </div>
            <div>
              <dt>Token</dt>
              <dd>{overview.usage.tokenCount.toLocaleString('zh-CN')}</dd>
            </div>
            <div>
              <dt>成本记录</dt>
              <dd>¥{(overview.usage.costMicros / 1_000_000).toFixed(2)}</dd>
            </div>
            <div>
              <dt>知识关系</dt>
              <dd>{overview.knowledge.relationCount.toLocaleString('zh-CN')}</dd>
            </div>
          </dl>
        </section>
      </div>

      <section
        aria-labelledby="aios-trace-stream-heading"
        className="saas-workspace-panel aios-list-panel"
      >
        <div className="aios-panel-heading">
          <div>
            <p className="saas-kicker">TRACE STREAM</p>
            <h2 id="aios-trace-stream-heading">脱敏运行事件</h2>
          </div>
          <p>只显示事件类型、工具、Agent 与时间；不会回显完整提示词、原始知识或密钥。</p>
        </div>
        {overview.traces.length === 0 ? (
          <p className="saas-empty-state">任务运行后会自动积累审计 Trace。</p>
        ) : (
          <ol className="aios-observability-traces">
            {overview.traces.map((trace) => (
              <li key={trace.id}>
                <time dateTime={trace.createdAt.toISOString()}>
                  {formatSaasDate(trace.createdAt.toISOString())}
                </time>
                <strong>{formatTraceEvent(trace.event)}</strong>
                <span>{trace.agent?.name ?? trace.toolKey ?? '系统调度'}</span>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
}: Readonly<{
  readonly icon: typeof Activity;
  readonly label: string;
  readonly value: number;
}>): React.JSX.Element {
  return (
    <article className="aios-metric">
      <Icon aria-hidden="true" size={18} />
      <span>{label}</span>
      <strong>{value.toLocaleString('zh-CN')}</strong>
    </article>
  );
}

function formatTaskStatus(status: string): string {
  switch (status) {
    case 'APPROVED':
      return '已批准';
    case 'AWAITING_APPROVAL':
      return '等待审批';
    case 'COMPLETED':
      return '已完成';
    case 'FAILED':
      return '未完成';
    case 'QUEUED':
      return '已入队';
    case 'RUNNING':
      return '运行中';
    default:
      return status;
  }
}

function formatTraceEvent(event: string): string {
  switch (event) {
    case 'AGENT_COMPLETED':
      return 'Agent 完成';
    case 'AGENT_STARTED':
      return 'Agent 启动';
    case 'APPROVAL_REQUIRED':
      return '等待审批';
    case 'APPROVAL_RESOLVED':
      return '审批已处理';
    case 'TASK_COMPLETED':
      return '任务完成';
    case 'TASK_FAILED':
      return '任务未完成';
    case 'TASK_QUEUED':
      return '任务入队';
    case 'TOOL_CALLED':
      return '调用工具';
    default:
      return event;
  }
}
