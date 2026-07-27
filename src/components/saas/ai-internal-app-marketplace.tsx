import { ArrowRight, BadgeCheck, Blocks, CirclePlay, LockKeyhole, UsersRound } from 'lucide-react';
import Link from 'next/link';

import type { AiAppType } from '@/ai/blocks/contracts';
import { formatSaasDate } from '@/lib/saas-presentation';

const appTypeLabels = {
  CUSTOMER: '客服',
  DATA: '数据分析',
  KNOWLEDGE: '知识助手',
  SALES: '销售助手',
  WORKFLOW: '自动化流程',
} as const satisfies Readonly<Record<AiAppType, string>>;

type AiInternalAppMarketplaceProps = Readonly<{
  readonly apps: readonly Readonly<{
    readonly createdAt: string;
    readonly description?: string;
    readonly id: string;
    readonly name: string;
    readonly publishedAt?: string;
    readonly slug: string;
    readonly type: AiAppType;
    readonly workspaceName: string;
  }>[];
  readonly organizationSlug: string;
}>;

export function AiInternalAppMarketplace({
  apps,
  organizationSlug,
}: AiInternalAppMarketplaceProps): React.JSX.Element {
  return (
    <div className="ai-internal-marketplace">
      <section
        aria-labelledby="ai-internal-marketplace-heading"
        className="ai-internal-marketplace-intro"
      >
        <div>
          <p className="saas-kicker">PRIVATE APP MARKETPLACE</p>
          <h1 id="ai-internal-marketplace-heading">为当前企业发布的 AI 应用。</h1>
          <p>
            这里只显示你具备访问权限的生产应用。每次对话都保留既有的组织、知识、工具和计量边界。
          </p>
        </div>
        <div className="ai-internal-marketplace-trust">
          <LockKeyhole aria-hidden="true" size={18} />
          <span>受组织登录与访问规则保护</span>
        </div>
      </section>

      {apps.length === 0 ? (
        <section className="saas-workspace-panel ai-app-empty-directory">
          <Blocks aria-hidden="true" size={28} />
          <h2>暂时没有可使用的应用</h2>
          <p>当管理员完成测试并发布应用后，满足授权范围的成员会在这里看到入口。</p>
        </section>
      ) : (
        <section aria-label="已授权 AI 应用" className="ai-internal-marketplace-grid">
          {apps.map((app) => (
            <article key={app.id}>
              <div className="ai-internal-app-card-topline">
                <span>{appTypeLabels[app.type]}</span>
                <BadgeCheck aria-label="已发布" size={18} />
              </div>
              <h2>{app.name}</h2>
              <p>{app.description ?? '这个应用由当前企业配置并发布，使用范围遵循组织权限。'}</p>
              <dl>
                <div>
                  <dt>
                    <UsersRound aria-hidden="true" size={15} /> Workspace
                  </dt>
                  <dd>{app.workspaceName}</dd>
                </div>
                <div>
                  <dt>发布时间</dt>
                  <dd>{formatSaasDate(app.publishedAt ?? app.createdAt)}</dd>
                </div>
              </dl>
              <Link href={`/app/${app.slug}?organization=${encodeURIComponent(organizationSlug)}`}>
                打开应用 <CirclePlay aria-hidden="true" size={16} />
              </Link>
            </article>
          ))}
        </section>
      )}
      <Link
        className="ai-internal-marketplace-back"
        href={`/dashboard/apps?organization=${encodeURIComponent(organizationSlug)}`}
      >
        返回应用目录 <ArrowRight aria-hidden="true" size={15} />
      </Link>
    </div>
  );
}
