import { AdminPageHeader } from '@/components/admin/admin-page-primitives';
import {
  getSystemHealth,
  type SystemHealthServices,
  type SystemServiceStatus,
} from '@/server/observability/health';

const serviceCards: readonly Readonly<{
  readonly description: string;
  readonly key: keyof SystemHealthServices;
  readonly label: string;
}>[] = [
  {
    description: 'Next.js 页面与健康检查接口正在响应。',
    key: 'website',
    label: 'Website',
  },
  {
    description: '通过只读查询检查 CMS PostgreSQL 连接。',
    key: 'database',
    label: 'Database',
  },
  {
    description: '检查 AI Provider、模型和服务端密钥是否完整配置。',
    key: 'ai',
    label: 'AI Service',
  },
  {
    description: '检查 Resend 密钥和合作邮箱是否同时配置。',
    key: 'email',
    label: 'Email Service',
  },
  {
    description: '检查 Sentry DSN 是否已配置；性能数据由 Vercel 收集。',
    key: 'monitoring',
    label: 'Monitoring',
  },
];

const statusLabels: Readonly<Record<SystemServiceStatus, string>> = {
  error: '异常',
  healthy: '正常',
  'not-configured': '未配置',
  warning: '注意',
};

export const dynamic = 'force-dynamic';

export default async function AdminSystemPage(): Promise<React.JSX.Element> {
  const health = await getSystemHealth();

  return (
    <>
      <AdminPageHeader
        description="查看当前部署的运行状态。页面只展示配置和连通性，不显示密钥、客户内容或错误详情。"
        eyebrow="OPERATIONS / SYSTEM"
        title="系统状态"
      />
      <section aria-label="系统服务状态" className="admin-dashboard-grid">
        {serviceCards.map((service) => {
          const status = health.services[service.key].status;

          return (
            <article className="admin-stat-card admin-system-card" key={service.key}>
              <p>{service.label}</p>
              <strong data-status={status}>{statusLabels[status]}</strong>
              <span>{service.description}</span>
            </article>
          );
        })}
      </section>
      <section className="admin-panel">
        <div className="admin-panel-header">
          <div>
            <p className="admin-kicker">HEALTH CHECK</p>
            <h2>{health.status === 'ok' ? '服务运行正常' : '存在需要处理的服务异常'}</h2>
          </div>
        </div>
        <div className="admin-panel-body">
          <p>
            最近检查：
            {new Intl.DateTimeFormat('zh-CN', { dateStyle: 'medium', timeStyle: 'medium' }).format(
              new Date(health.checkedAt),
            )}
          </p>
          <p>
            外部可用性监控请请求 <code>/api/health</code>；该接口不会缓存，并会在核心服务异常时返回
            503。
          </p>
          <p>
            最近系统错误由 Sentry 收集。为保护用户和密钥信息，此后台不镜像错误详情；请在 Sentry
            项目面板中处理告警。
          </p>
        </div>
      </section>
    </>
  );
}
