import { AlertTriangle, Bot, Building2, FileText, Sparkles } from 'lucide-react';

import { formatSaasDate } from '@/lib/saas-presentation';

type AiPlatformAdminOverviewProps = Readonly<{
  readonly overview: NonNullable<
    Awaited<ReturnType<typeof import('@/server/saas/ai-admin').getAiPlatformAdminOverview>>
  >;
}>;

export function AiPlatformAdminOverview({
  overview,
}: AiPlatformAdminOverviewProps): React.JSX.Element {
  const readyDocuments =
    overview.documentStatus.find((item) => item.status === 'READY')?._count._all ?? 0;
  const failedDocuments =
    overview.documentStatus.find((item) => item.status === 'FAILED')?._count._all ?? 0;

  return (
    <div className="saas-billing-admin-tables">
      <section aria-label="AI 平台运营指标" className="saas-business-metric-grid">
        <article className="saas-workspace-panel">
          <Building2 aria-hidden="true" size={19} />
          <span>接入企业</span>
          <strong>{overview.organizationCount}</strong>
        </article>
        <article className="saas-workspace-panel">
          <Sparkles aria-hidden="true" size={19} />
          <span>AI Workspace</span>
          <strong>{overview.workspaceCount}</strong>
        </article>
        <article className="saas-workspace-panel">
          <Bot aria-hidden="true" size={19} />
          <span>已发布助手</span>
          <strong>{overview.assistantCount}</strong>
        </article>
        <article className="saas-workspace-panel">
          <FileText aria-hidden="true" size={19} />
          <span>可检索文档</span>
          <strong>{readyDocuments}</strong>
        </article>
      </section>
      <section className="saas-workspace-panel saas-ai-panel">
        <div className="saas-panel-heading">
          <div>
            <p className="saas-kicker">USAGE</p>
            <h2>模型调用与成本记录</h2>
          </div>
          <p>只展示汇总的调用、Token 和成本字段；不会保存或展示完整用户对话内容。</p>
        </div>
        <ul className="saas-business-usage-list">
          <li>
            <span>调用次数</span>
            <strong>{overview.usage.requests.toLocaleString('zh-CN')}</strong>
          </li>
          <li>
            <span>Token</span>
            <strong>{overview.usage.tokens.toLocaleString('zh-CN')}</strong>
          </li>
          <li>
            <span>成本记录</span>
            <strong>¥{(overview.usage.costMicros / 1_000_000).toFixed(2)}</strong>
          </li>
          <li>
            <span>失败文档</span>
            <strong>{failedDocuments}</strong>
          </li>
        </ul>
      </section>
      <section className="saas-workspace-panel saas-ai-panel">
        <div className="saas-panel-heading">
          <div>
            <p className="saas-kicker">MODELS</p>
            <h2>模型管理状态</h2>
          </div>
          <p>模型 Provider 在现有 AI Center 中配置；助手仅允许调用被启用的模型。</p>
        </div>
        <ul className="saas-business-usage-list">
          {overview.models.length === 0 ? (
            <li>
              <span>尚未写入模型配置</span>
              <strong>使用环境变量模型</strong>
            </li>
          ) : (
            overview.models.map((model) => (
              <li key={`${model.provider}-${model.model}`}>
                <span>
                  {model.provider} / {model.model}
                </span>
                <strong>
                  {model.enabled ? '已启用' : '已停用'} ·{' '}
                  {formatSaasDate(model.updatedAt.toISOString())}
                </strong>
              </li>
            ))
          )}
        </ul>
      </section>
      <section className="saas-workspace-panel saas-ai-panel">
        <div className="saas-panel-heading">
          <div>
            <p className="saas-kicker">FAILED JOBS</p>
            <h2>需要关注的文档处理任务</h2>
          </div>
          <p>失败信息不回显原文内容；可回到企业 AI Platform 重新处理对应文件。</p>
        </div>
        {overview.failedJobs.length === 0 ? (
          <p className="saas-empty-state">当前没有失败的文档处理任务。</p>
        ) : (
          <ul className="saas-business-usage-list">
            {overview.failedJobs.map((job) => (
              <li key={job.id}>
                <span>
                  {job.organization.name} / {job.workspace.name} / {job.document.title}
                </span>
                <strong>
                  <AlertTriangle aria-hidden="true" size={14} />{' '}
                  {formatSaasDate(job.updatedAt.toISOString())}
                </strong>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
