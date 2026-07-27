import {
  Activity,
  ArrowRight,
  Blocks,
  CirclePlay,
  FlaskConical,
  Plus,
  UsersRound,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import Link from 'next/link';

import type { AiAppLifecycleStatus, AiAppType } from '@/ai/blocks/contracts';
import { formatSaasDate } from '@/lib/saas-presentation';

const appTypeLabels = {
  CUSTOMER: '客服',
  DATA: '数据分析',
  KNOWLEDGE: '知识助手',
  SALES: '销售助手',
  WORKFLOW: '自动化流程',
} as const satisfies Readonly<Record<AiAppType, string>>;

const lifecycleLabels = {
  ARCHIVED: '已归档',
  DRAFT: '草稿',
  PUBLISHED: '已发布',
  TESTING: '测试中',
} as const satisfies Readonly<Record<AiAppLifecycleStatus, string>>;

type AiAppsDashboardProps = Readonly<{
  readonly analytics: Readonly<{
    readonly activeUserCount: number;
    readonly costMicros: number;
    readonly failureRate: number;
    readonly requestCount: number;
    readonly tokenCount: number;
  }>;
  readonly apps: readonly Readonly<{
    readonly blockCount: number;
    readonly id: string;
    readonly metric: Readonly<{
      readonly activeUserCount: number;
      readonly failureRate: number;
      readonly requestCount: number;
    }>;
    readonly name: string;
    readonly published: boolean;
    readonly slug: string;
    readonly status: AiAppLifecycleStatus;
    readonly type: AiAppType;
    readonly updatedAt: string;
    readonly workspaceName: string;
  }>[];
  readonly canManage: boolean;
  readonly organizationSlug: string;
  readonly templates: readonly Readonly<{
    readonly category: string;
    readonly description: string;
    readonly key: string;
    readonly name: string;
    readonly type: AiAppType;
  }>[];
}>;

export function AiAppsDashboard({
  analytics,
  apps,
  canManage,
  organizationSlug,
  templates,
}: AiAppsDashboardProps): React.JSX.Element {
  const appBuilderHref = `/dashboard/apps/builder?organization=${encodeURIComponent(organizationSlug)}`;

  return (
    <div className="ai-apps-dashboard">
      <section aria-label="近 30 天应用使用概览" className="ai-app-analytics-grid">
        <Metric
          icon={CirclePlay}
          label="应用调用"
          value={analytics.requestCount.toLocaleString('zh-CN')}
        />
        <Metric
          icon={UsersRound}
          label="活跃成员"
          value={analytics.activeUserCount.toLocaleString('zh-CN')}
        />
        <Metric icon={Activity} label="失败率" value={formatPercentage(analytics.failureRate)} />
        <Metric
          icon={Blocks}
          label="Token 用量"
          value={formatCompactNumber(analytics.tokenCount)}
        />
      </section>

      <section aria-labelledby="ai-app-template-heading" className="ai-app-template-directory">
        <div className="ai-app-section-title">
          <div>
            <p className="saas-kicker">START WITH A PATTERN</p>
            <h2 id="ai-app-template-heading">从可控模板开始</h2>
          </div>
          {canManage ? (
            <Link className="saas-secondary-button" href={appBuilderHref}>
              <Plus aria-hidden="true" size={16} />
              空白应用
            </Link>
          ) : null}
        </div>
        <div className="ai-app-template-grid">
          {templates.map((template) => (
            <article key={template.key}>
              <div>
                <span>{appTypeLabels[template.type]}</span>
                <small>{template.category}</small>
              </div>
              <h3>{template.name}</h3>
              <p>{template.description}</p>
              {canManage ? (
                <Link href={`${appBuilderHref}&template=${encodeURIComponent(template.key)}`}>
                  使用模板 <ArrowRight aria-hidden="true" size={15} />
                </Link>
              ) : (
                <span className="ai-app-muted-action">需要 ai.manage 权限</span>
              )}
            </article>
          ))}
        </div>
      </section>

      <section
        aria-labelledby="ai-app-list-heading"
        className="saas-workspace-panel ai-app-directory"
      >
        <div className="ai-app-section-title">
          <div>
            <p className="saas-kicker">LIFECYCLE DIRECTORY</p>
            <h2 id="ai-app-list-heading">当前企业的 AI 应用</h2>
          </div>
          <p>近 30 天成本 {formatCost(analytics.costMicros)}，所有数据按当前组织隔离。</p>
        </div>
        {apps.length === 0 ? (
          <div className="ai-app-empty-directory">
            <Blocks aria-hidden="true" size={26} />
            <p>还没有 AI 应用。选择上方模板，先在 Sandbox 中验证业务边界。</p>
            {canManage ? (
              <Link className="saas-primary-button" href={appBuilderHref}>
                创建首个应用
              </Link>
            ) : null}
          </div>
        ) : (
          <ul className="ai-app-directory-list">
            {apps.map((app) => (
              <li key={app.id}>
                <div className="ai-app-directory-name">
                  <span data-status={app.status}>{lifecycleLabels[app.status]}</span>
                  <div>
                    <strong>{app.name}</strong>
                    <small>
                      {appTypeLabels[app.type]} · {app.workspaceName} · {app.blockCount} 个 Block
                    </small>
                  </div>
                </div>
                <dl>
                  <div>
                    <dt>调用</dt>
                    <dd>{app.metric.requestCount}</dd>
                  </div>
                  <div>
                    <dt>成员</dt>
                    <dd>{app.metric.activeUserCount}</dd>
                  </div>
                  <div>
                    <dt>失败率</dt>
                    <dd>{formatPercentage(app.metric.failureRate)}</dd>
                  </div>
                </dl>
                <time dateTime={app.updatedAt}>更新于 {formatSaasDate(app.updatedAt)}</time>
                <div className="ai-app-directory-actions">
                  {app.published ? (
                    <Link
                      href={`/app/${app.slug}?organization=${encodeURIComponent(organizationSlug)}`}
                    >
                      使用应用 <CirclePlay aria-hidden="true" size={15} />
                    </Link>
                  ) : null}
                  {canManage ? (
                    <Link href={`${appBuilderHref}&app=${encodeURIComponent(app.id)}`}>
                      {app.status === 'TESTING' ? (
                        <FlaskConical aria-hidden="true" size={15} />
                      ) : (
                        <Blocks aria-hidden="true" size={15} />
                      )}
                      编辑
                    </Link>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
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
  readonly value: string;
}>): React.JSX.Element {
  return (
    <article className="ai-app-analytics-metric">
      <Icon aria-hidden="true" size={18} />
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

function formatCompactNumber(value: number): string {
  return new Intl.NumberFormat('zh-CN', { notation: 'compact', maximumFractionDigits: 1 }).format(
    value,
  );
}

function formatPercentage(value: number): string {
  return new Intl.NumberFormat('zh-CN', { maximumFractionDigits: 1, style: 'percent' }).format(
    value,
  );
}

function formatCost(costMicros: number): string {
  return costMicros <= 0 ? '暂未产生可计量成本' : `¥${(costMicros / 1_000_000).toFixed(2)}`;
}
