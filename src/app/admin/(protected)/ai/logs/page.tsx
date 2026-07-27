import { AdminPageHeader, AdminSetupNotice } from '@/components/admin/admin-page-primitives';
import { AiCenterNavigation } from '@/components/ai-center/ai-center-navigation';
import { AiUsageLogList } from '@/components/ai-center/ai-usage-log-list';
import { getAiCenterData } from '@/server/ai/queries';

export default async function AiLogsPage(): Promise<React.JSX.Element> {
  const data = await getAiCenterData();

  return (
    <>
      <AdminPageHeader
        description="调用日志只记录 Agent、状态、模型、Token 和成本字段，不保存客户内容、会议正文、Prompt 或密钥。"
        eyebrow="AI / AUDIT"
        title="AI 调用日志"
      />
      <AiCenterNavigation current="/admin/ai/logs" />
      {data === undefined ? (
        <AdminSetupNotice />
      ) : (
        <section className="admin-panel">
          <div className="admin-panel-body">
            <AiUsageLogList logs={data.logs} />
          </div>
        </section>
      )}
    </>
  );
}
