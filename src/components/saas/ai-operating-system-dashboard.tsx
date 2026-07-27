import { Bot, FileCheck2, Network, ShieldCheck, Wrench } from 'lucide-react';
import Link from 'next/link';

import { AiApprovalActions } from '@/components/saas/ai-approval-actions';
import { AiTaskComposer } from '@/components/saas/ai-task-composer';
import { AiWorkflowCanvas } from '@/components/saas/ai-workflow-canvas';
import { formatSaasDate } from '@/lib/saas-presentation';

type AiOperatingSystemDashboardProps = Readonly<{
  readonly canManage: boolean;
  readonly canRun: boolean;
  readonly organizationSlug: string;
  readonly overview: NonNullable<
    Awaited<
      ReturnType<
        typeof import('@/server/saas/ai-operating-system-overview').getAiOperatingSystemOverview
      >
    >
  >;
}>;

export function AiOperatingSystemDashboard({
  canManage,
  canRun,
  organizationSlug,
  overview,
}: AiOperatingSystemDashboardProps): React.JSX.Element {
  const pendingApprovals = overview.approvals.filter((approval) => approval.status === 'PENDING');
  const workflow = overview.workflows[0];

  return (
    <div className="aios-dashboard">
      <section aria-label="AIOS 运行状态" className="aios-metric-grid">
        <Metric
          icon={Bot}
          label="可用 Agent"
          value={overview.agents.filter((agent) => agent.enabled).length}
        />
        <Metric
          icon={Network}
          label="知识图谱"
          value={overview.knowledge.entityCount}
          suffix="实体"
        />
        <Metric icon={FileCheck2} label="可复核报告" value={overview.reports.length} />
        <Metric icon={ShieldCheck} label="待审批操作" value={pendingApprovals.length} />
      </section>

      <div className="aios-primary-grid">
        <AiTaskComposer
          canRun={canRun}
          organizationSlug={organizationSlug}
          workspaces={overview.workspaces}
        />
        <section aria-labelledby="aios-guardrail-heading" className="aios-guardrail-panel">
          <div className="aios-panel-heading">
            <div>
              <p className="saas-kicker">EXECUTION BOUNDARY</p>
              <h2 id="aios-guardrail-heading">先审阅，再行动</h2>
            </div>
          </div>
          <ul>
            <li>
              <span>人工审批</span>
              <strong>{overview.governance?.requireHumanApproval ? '已启用' : '未配置'}</strong>
            </li>
            <li>
              <span>已授权工具</span>
              <strong>{overview.tools.filter((tool) => tool.enabled).length}</strong>
            </li>
            <li>
              <span>外部写入</span>
              <strong>未启用</strong>
            </li>
          </ul>
          <p>
            高风险请求只会创建审批记录。当前没有配置外部业务工具，因此批准不会写入
            CRM、项目或数据库。
          </p>
        </section>
      </div>

      <AiWorkflowCanvas {...(workflow === undefined ? {} : { workflow })} />

      <div className="aios-detail-grid">
        <section
          aria-labelledby="aios-agents-heading"
          className="saas-workspace-panel aios-list-panel"
        >
          <div className="aios-panel-heading">
            <div>
              <p className="saas-kicker">AGENT TEAM</p>
              <h2 id="aios-agents-heading">协作角色与 AI 员工</h2>
            </div>
            <p>
              {overview.employees.filter((employee) => employee.status === 'ACTIVE').length} 位在岗
            </p>
          </div>
          {overview.agents.length === 0 ? (
            <p className="saas-empty-state">
              选择 Workspace 并提交首个任务后，将自动建立默认 Agent 团队。
            </p>
          ) : (
            <ul className="aios-status-list">
              {overview.agents.map((agent) => (
                <li key={agent.id}>
                  <span className="aios-status-dot" data-active={agent.enabled} />
                  <div>
                    <strong>{agent.name}</strong>
                    <small>
                      {formatAgentRole(agent.role)} · {agent.workspace.name}
                    </small>
                  </div>
                  <em>{agent.enabled ? '在线' : '暂停'}</em>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section
          aria-labelledby="aios-approvals-heading"
          className="saas-workspace-panel aios-list-panel"
        >
          <div className="aios-panel-heading">
            <div>
              <p className="saas-kicker">HUMAN APPROVAL</p>
              <h2 id="aios-approvals-heading">需要人来决定的操作</h2>
            </div>
          </div>
          {pendingApprovals.length === 0 ? (
            <p className="saas-empty-state">当前没有等待人工决定的高风险任务。</p>
          ) : (
            <ul className="aios-approval-list">
              {pendingApprovals.map((approval) => (
                <li key={approval.id}>
                  <div>
                    <strong>{shortenText(approval.taskRun.requestSummary, 96)}</strong>
                    <small>
                      {approval.toolKey} · {formatSaasDate(approval.requestedAt.toISOString())}
                    </small>
                  </div>
                  {canManage ? (
                    <AiApprovalActions
                      approvalId={approval.id}
                      organizationSlug={organizationSlug}
                    />
                  ) : (
                    <em>需要 ai.manage</em>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <div className="aios-detail-grid">
        <section
          aria-labelledby="aios-reports-heading"
          className="saas-workspace-panel aios-list-panel"
        >
          <div className="aios-panel-heading">
            <div>
              <p className="saas-kicker">REPORTS</p>
              <h2 id="aios-reports-heading">最近可复核输出</h2>
            </div>
          </div>
          {overview.reports.length === 0 ? (
            <p className="saas-empty-state">提交分析或知识任务后，这里会保留可复核的结果摘要。</p>
          ) : (
            <ul className="aios-report-list">
              {overview.reports.map((report) => (
                <li key={report.id}>
                  <div>
                    <strong>{report.title}</strong>
                    <small>
                      {report.workspace.name} · {formatSaasDate(report.createdAt.toISOString())}
                    </small>
                  </div>
                  <FileCheck2 aria-hidden="true" size={18} />
                </li>
              ))}
            </ul>
          )}
        </section>

        <section
          aria-labelledby="aios-trace-heading"
          className="saas-workspace-panel aios-list-panel"
        >
          <div className="aios-panel-heading">
            <div>
              <p className="saas-kicker">OBSERVABILITY</p>
              <h2 id="aios-trace-heading">近期 Trace</h2>
            </div>
            <Link href={`/dashboard/ai-observability?organization=${organizationSlug}`}>
              打开观测台
            </Link>
          </div>
          {overview.traces.length === 0 ? (
            <p className="saas-empty-state">任务开始后会记录脱敏 Trace，不保存完整提示词或密钥。</p>
          ) : (
            <ul className="aios-trace-list">
              {overview.traces.slice(0, 6).map((trace) => (
                <li key={trace.id}>
                  <Wrench aria-hidden="true" size={15} />
                  <div>
                    <strong>{formatTraceEvent(trace.event)}</strong>
                    <small>
                      {trace.agent?.name ?? shortenText(trace.taskRun.requestSummary, 56)}
                    </small>
                  </div>
                  <time dateTime={trace.createdAt.toISOString()}>
                    {formatSaasDate(trace.createdAt.toISOString())}
                  </time>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

function Metric({
  icon: Icon,
  label,
  suffix,
  value,
}: Readonly<{
  readonly icon: typeof Bot;
  readonly label: string;
  readonly suffix?: string;
  readonly value: number;
}>): React.JSX.Element {
  return (
    <article className="aios-metric">
      <Icon aria-hidden="true" size={18} />
      <span>{label}</span>
      <strong>
        {value.toLocaleString('zh-CN')}
        {suffix === undefined ? null : <small>{suffix}</small>}
      </strong>
    </article>
  );
}

function formatAgentRole(role: string): string {
  switch (role) {
    case 'ACTION':
      return '行动 Agent';
    case 'DATA':
      return '数据 Agent';
    case 'PLANNER':
      return '规划 Agent';
    case 'RESEARCH':
      return '研究 Agent';
    case 'WRITER':
      return '报告 Agent';
    default:
      return role;
  }
}

function formatTraceEvent(event: string): string {
  switch (event) {
    case 'AGENT_COMPLETED':
      return 'Agent 已完成';
    case 'AGENT_STARTED':
      return 'Agent 已开始';
    case 'APPROVAL_REQUIRED':
      return '等待人工审批';
    case 'APPROVAL_RESOLVED':
      return '审批已处理';
    case 'TASK_COMPLETED':
      return '任务已完成';
    case 'TASK_FAILED':
      return '任务未完成';
    case 'TASK_QUEUED':
      return '任务已入队';
    case 'TOOL_CALLED':
      return '工具已调用';
    default:
      return event;
  }
}

function shortenText(value: string, limit: number): string {
  return value.length <= limit ? value : `${value.slice(0, limit)}…`;
}
