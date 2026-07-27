import { AdminPageHeader, AdminSetupNotice } from '@/components/admin/admin-page-primitives';
import { AiPlatformAdminOverview } from '@/components/saas/ai-platform-admin-overview';
import { getAiPlatformAdminOverview } from '@/server/saas/ai-admin';

export const dynamic = 'force-dynamic';

export default async function AiPlatformAdminPage(): Promise<React.JSX.Element> {
  const overview = await getAiPlatformAdminOverview();

  return (
    <>
      <AdminPageHeader
        description="查看组织级 AI Workspace、知识文档处理、模型调用、用量和失败作业。页面只显示聚合运营数据，不展示完整聊天内容。"
        eyebrow="SAAS / AI PLATFORM"
        title="AI 平台运营"
      />
      {overview === undefined ? (
        <AdminSetupNotice />
      ) : (
        <AiPlatformAdminOverview overview={overview} />
      )}
    </>
  );
}
