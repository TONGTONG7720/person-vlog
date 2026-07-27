import type { Metadata } from 'next';

import { AdminLoginForm } from '@/components/admin/login-form';
import { isCmsAuthenticationConfigured } from '@/server/cms/auth';

export const metadata: Metadata = {
  robots: { follow: false, index: false },
  title: '管理员登录',
};

export default function AdminLoginPage(): React.JSX.Element {
  const authenticationConfigured = isCmsAuthenticationConfigured();

  return (
    <section className="admin-login-page">
      <div className="admin-login-panel">
        <p className="admin-kicker">TONG / CMS</p>
        <h1>内容管理后台</h1>
        <p>登录后管理项目、文章、服务、咨询和 AI 知识库。</p>
        {authenticationConfigured ? (
          <AdminLoginForm />
        ) : (
          <p className="admin-setup-notice" role="status">
            请先配置 DATABASE_URL、AUTH_SECRET、ADMIN_EMAIL，并运行数据库迁移与管理员初始化。
          </p>
        )}
      </div>
    </section>
  );
}
