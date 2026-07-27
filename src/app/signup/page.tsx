import type { Metadata } from 'next';

import { SignupForm } from '@/components/saas/signup-form';
import { isSaasAuthenticationConfigured } from '@/server/cms/auth';

export const metadata: Metadata = {
  robots: { follow: false, index: false },
  title: '创建企业空间',
};

export default function SignupPage(): React.JSX.Element {
  const authenticationConfigured = isSaasAuthenticationConfigured();

  return (
    <section className="saas-entry-page">
      <div className="saas-entry-panel">
        <p className="saas-kicker">TONG / COLLABORATION</p>
        <h1>为交付建立一个清晰的协作空间。</h1>
        <p>创建企业空间后，可以邀请成员、查看项目进度、管理私有文档，并使用项目专属知识助手。</p>
        {authenticationConfigured ? (
          <SignupForm />
        ) : (
          <p className="saas-setup-notice" role="status">
            企业账户系统尚未完成配置。请先配置 DATABASE_URL 和 AUTH_SECRET，并执行数据库迁移。
          </p>
        )}
      </div>
    </section>
  );
}
