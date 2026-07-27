import { Activity, Blocks, ShieldCheck, UsersRound } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { formatSaasDate } from '@/lib/saas-presentation';

type AiAppAdminDashboardProps = Readonly<{
  readonly overview: NonNullable<
    Awaited<
      ReturnType<typeof import('@/server/saas/ai-native-app-admin').getAiNativeAppAdminOverview>
    >
  >;
}>;

export function AiAppAdminDashboard({ overview }: AiAppAdminDashboardProps): React.JSX.Element {
  const statusCount = (status: string) =>
    overview.statusCounts.find((item) => item.status === status)?._count._all ?? 0;

  return (
    <div className="ai-app-admin-dashboard">
      <section aria-label="AI 应用平台概览" className="admin-summary-grid">
        <Metric icon={Blocks} label="已启用模板" value={overview.templateCount} />
        <Metric icon={Activity} label="近 30 天调用" value={overview.usage.requestCount} />
        <Metric icon={UsersRound} label="已发布应用" value={statusCount('PUBLISHED')} />
        <Metric icon={ShieldCheck} label="测试中应用" value={statusCount('TESTING')} />
      </section>
      <section className="admin-table-card" aria-labelledby="admin-ai-apps-heading">
        <div className="admin-table-card-heading">
          <div>
            <p className="admin-eyebrow">PRIVATE APP GOVERNANCE</p>
            <h2 id="admin-ai-apps-heading">AI 应用、模板与访问范围</h2>
          </div>
          <p>这里仅显示管理信息，不显示系统提示词、密钥或知识正文。</p>
        </div>
        {overview.apps.length === 0 ? (
          <p className="admin-empty-state">当前还没有任何企业 AI 应用。</p>
        ) : (
          <div className="admin-table-scroll">
            <table>
              <thead>
                <tr>
                  <th scope="col">应用</th>
                  <th scope="col">企业空间</th>
                  <th scope="col">状态</th>
                  <th scope="col">访问规则</th>
                  <th scope="col">更新时间</th>
                </tr>
              </thead>
              <tbody>
                {overview.apps.map((app) => (
                  <tr key={app.id}>
                    <td>
                      <strong>{app.name}</strong>
                      <small>{app.slug}</small>
                    </td>
                    <td>
                      {app.organization.name}
                      <small>{app.workspace.name}</small>
                    </td>
                    <td>
                      <span className="admin-status-pill">{formatStatus(app.status)}</span>
                    </td>
                    <td>{app.accessRules.map((rule) => formatRule(rule.kind)).join('、')}</td>
                    <td>{formatSaasDate(app.updatedAt.toISOString())}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
  readonly icon: LucideIcon;
  readonly label: string;
  readonly value: number;
}>): React.JSX.Element {
  return (
    <article className="admin-summary-card">
      <Icon aria-hidden="true" size={19} />
      <span>{label}</span>
      <strong>{value.toLocaleString('zh-CN')}</strong>
    </article>
  );
}

function formatStatus(value: string): string {
  switch (value) {
    case 'DRAFT':
      return '草稿';
    case 'TESTING':
      return '测试中';
    case 'PUBLISHED':
      return '已发布';
    case 'ARCHIVED':
      return '已归档';
    default:
      return value;
  }
}

function formatRule(value: string): string {
  switch (value) {
    case 'ALL_MEMBERS':
      return '所有成员';
    case 'ROLE':
      return '角色';
    case 'DEPARTMENT':
      return '部门';
    case 'MEMBERSHIP':
      return '指定成员';
    default:
      return value;
  }
}
