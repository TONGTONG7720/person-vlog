import { Bot, FileText, Network, ShieldCheck } from 'lucide-react';

import { formatAdminDate } from '@/components/admin/admin-page-primitives';

type AiGovernanceDashboardProps = Readonly<{
  readonly overview: NonNullable<
    Awaited<
      ReturnType<
        typeof import('@/server/saas/ai-operating-system-overview').getAiOperatingSystemAdminOverview
      >
    >
  >;
}>;

export function AiGovernanceDashboard({ overview }: AiGovernanceDashboardProps): React.JSX.Element {
  return (
    <div className="aios-governance">
      <section aria-label="AIOS 平台治理指标" className="aios-metric-grid">
        <Metric icon={Bot} label="已启用 Agent" value={overview.agents} />
        <Metric icon={Network} label="已启用工作流" value={overview.workflows} />
        <Metric icon={ShieldCheck} label="组织治理策略" value={overview.policies} />
        <Metric icon={FileText} label="可复核报告" value={overview.reports} />
      </section>

      <div className="aios-detail-grid">
        <section
          aria-labelledby="aios-models-heading"
          className="saas-workspace-panel aios-list-panel"
        >
          <div className="aios-panel-heading">
            <div>
              <p className="saas-kicker">MODEL CONTROL</p>
              <h2 id="aios-models-heading">模型接入状态</h2>
            </div>
          </div>
          {overview.models.length === 0 ? (
            <p className="saas-empty-state">
              尚未保存模型配置，当前由既有 AI Center 的环境变量配置提供服务。
            </p>
          ) : (
            <ul className="aios-report-list">
              {overview.models.map((model) => (
                <li key={`${model.provider}-${model.model}`}>
                  <div>
                    <strong>{model.model}</strong>
                    <small>{model.provider}</small>
                  </div>
                  <em>{model.enabled ? '已启用' : '已停用'}</em>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section
          aria-labelledby="aios-policy-heading"
          className="saas-workspace-panel aios-list-panel"
        >
          <div className="aios-panel-heading">
            <div>
              <p className="saas-kicker">POLICY STATE</p>
              <h2 id="aios-policy-heading">任务与审批分布</h2>
            </div>
          </div>
          <dl className="aios-definition-list">
            {overview.tasks.map((item) => (
              <div key={`task-${item.status}`}>
                <dt>{formatTaskStatus(item.status)}</dt>
                <dd>{item._count._all.toLocaleString('zh-CN')}</dd>
              </div>
            ))}
            {overview.approvals.map((item) => (
              <div key={`approval-${item.status}`}>
                <dt>审批 · {formatApprovalStatus(item.status)}</dt>
                <dd>{item._count._all.toLocaleString('zh-CN')}</dd>
              </div>
            ))}
          </dl>
        </section>
      </div>

      <section
        aria-labelledby="aios-admin-traces-heading"
        className="saas-workspace-panel aios-list-panel"
      >
        <div className="aios-panel-heading">
          <div>
            <p className="saas-kicker">GLOBAL TRACE</p>
            <h2 id="aios-admin-traces-heading">平台级审计事件</h2>
          </div>
          <p>只显示组织、事件和时间，不展示任何客户原始请求、密钥或知识正文。</p>
        </div>
        {overview.traces.length === 0 ? (
          <p className="saas-empty-state">
            尚无 AIOS Trace。组织启用并运行任务后，此处会出现脱敏审计事件。
          </p>
        ) : (
          <ol className="aios-observability-traces">
            {overview.traces.map((trace) => (
              <li key={trace.id}>
                <time dateTime={trace.createdAt.toISOString()}>
                  {formatAdminDate(trace.createdAt)}
                </time>
                <strong>{formatTraceEvent(trace.event)}</strong>
                <span>{trace.organization.name}</span>
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
  readonly icon: typeof Bot;
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

function formatApprovalStatus(status: string): string {
  switch (status) {
    case 'APPROVED':
      return '已批准';
    case 'EXECUTED':
      return '已执行';
    case 'EXPIRED':
      return '已过期';
    case 'PENDING':
      return '待处理';
    case 'REJECTED':
      return '已拒绝';
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
