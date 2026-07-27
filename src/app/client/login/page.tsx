import type { Metadata } from 'next';

import { ClientLoginForm } from '@/components/saas/client-login-form';
import { isSaasAuthenticationConfigured } from '@/server/cms/auth';

export const metadata: Metadata = {
  robots: { follow: false, index: false },
  title: '客户门户登录',
};

export default function ClientLoginPage(): React.JSX.Element {
  const authenticationConfigured = isSaasAuthenticationConfigured();

  return (
    <section className="saas-entry-page">
      <div className="saas-entry-panel">
        <p className="saas-kicker">TONG / CLIENT PORTAL</p>
        <h1>查看每一次项目推进。</h1>
        <p>在一个组织隔离的协作空间中查看项目、任务、交付文档与更新记录。</p>
        {authenticationConfigured ? (
          <ClientLoginForm />
        ) : (
          <p className="saas-setup-notice" role="status">
            客户门户尚未配置。请先配置 DATABASE_URL 和 AUTH_SECRET，并执行数据库迁移。
          </p>
        )}
      </div>
    </section>
  );
}
