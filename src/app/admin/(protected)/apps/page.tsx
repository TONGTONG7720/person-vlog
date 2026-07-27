import { AdminPageHeader, AdminSetupNotice } from '@/components/admin/admin-page-primitives';
import { AiAppAdminDashboard } from '@/components/admin/ai-app-admin-dashboard';
import { getAiNativeAppAdminOverview } from '@/server/saas/ai-native-app-admin';

export const dynamic = 'force-dynamic';

export default async function AdminAiAppsPage(): Promise<React.JSX.Element> {
  const overview = await getAiNativeAppAdminOverview();

  return (
    <>
      <AdminPageHeader
        description="查看企业 AI 应用的生命周期、模板、使用摘要和访问范围。运行时权限与外部工具边界仍由组织级服务端复核。"
        eyebrow="SAAS / AI APPLICATIONS"
        title="AI 应用治理"
      />
      {overview === undefined ? <AdminSetupNotice /> : <AiAppAdminDashboard overview={overview} />}
    </>
  );
}
