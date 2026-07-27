import { aiAutomationAgentLabels } from '@/ai/automation-types';
import { formatAdminDate } from '@/components/admin/admin-page-primitives';
import type { AiCenterData } from '@/server/ai/queries';

type AiUsageLogListProps = Readonly<{
  readonly logs: AiCenterData['logs'];
}>;

const statusLabels: Readonly<Record<string, string>> = {
  COMPLETED: '完成',
  FAILED: '失败',
  SKIPPED: '跳过',
};

export function AiUsageLogList({ logs }: AiUsageLogListProps): React.JSX.Element {
  if (logs.length === 0) {
    return (
      <p className="admin-empty-state">还没有 AI 调用日志。系统不会用示例数据填充成本或成功率。</p>
    );
  }

  return (
    <div className="admin-data-table-wrap">
      <table className="admin-data-table ai-usage-log-table">
        <thead>
          <tr>
            <th scope="col">Agent</th>
            <th scope="col">状态</th>
            <th scope="col">模型</th>
            <th scope="col">Token</th>
            <th scope="col">成本</th>
            <th scope="col">时间</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log.id}>
              <td>{aiAutomationAgentLabels[log.agent]}</td>
              <td>
                <span
                  className="admin-status-badge"
                  data-status={log.status.toLocaleLowerCase('en-US')}
                >
                  {statusLabels[log.status] ?? log.status}
                </span>
              </td>
              <td>
                <span className="ai-model-value">
                  {log.provider} / {log.model}
                </span>
              </td>
              <td>
                {log.inputTokens} in / {log.outputTokens} out
              </td>
              <td>{formatCost(log.costMicros)}</td>
              <td>{formatAdminDate(log.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function formatCost(costMicros: number): string {
  return costMicros === 0 ? '未配置单价' : `$${(costMicros / 1_000_000).toFixed(4)}`;
}
