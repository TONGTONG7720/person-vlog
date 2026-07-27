import { AdminPageHeader, AdminSetupNotice } from '@/components/admin/admin-page-primitives';
import { AiGovernanceDashboard } from '@/components/admin/ai-governance-dashboard';
import { getAiOperatingSystemAdminOverview } from '@/server/saas/ai-operating-system-overview';

export const dynamic = 'force-dynamic';

export default async function AiGovernancePage(): Promise<React.JSX.Element> {
  const overview = await getAiOperatingSystemAdminOverview();

  return (
    <>
      <AdminPageHeader
        description="查看平台范围内的模型、Agent、工作流、审批与脱敏 Trace。外部业务工具需要单独配置，当前不会从这里触发任何客户数据写入。"
        eyebrow="SAAS / AI GOVERNANCE"
        title="AI 企业治理"
      />
      {overview === undefined ? (
        <AdminSetupNotice />
      ) : (
        <AiGovernanceDashboard overview={overview} />
      )}
    </>
  );
}
