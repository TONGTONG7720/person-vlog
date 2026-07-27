import {
  AdminFormFeedback,
  AdminPageHeader,
  AdminSetupNotice,
} from '@/components/admin/admin-page-primitives';
import { AiCenterDashboard } from '@/components/ai-center/ai-center-dashboard';
import { AiCenterNavigation } from '@/components/ai-center/ai-center-navigation';
import { getAiCenterData } from '@/server/ai/queries';

type AiCenterPageProps = Readonly<{
  readonly searchParams: Promise<Readonly<Record<string, string | string[] | undefined>>>;
}>;

export default async function AiCenterPage({
  searchParams,
}: AiCenterPageProps): Promise<React.JSX.Element> {
  const [data, params] = await Promise.all([getAiCenterData(), searchParams]);

  return (
    <>
      <AdminPageHeader
        description="分析需求、整理方案、维护知识与生成内容草稿；所有业务判断、报价、发布和交付均保留人工确认。"
        eyebrow="AI / BUSINESS COPILOT"
        title="AI 自动化运营"
      />
      <AiCenterNavigation current="/admin/ai" />
      <AdminFormFeedback error={params['error']} success={params['success']} />
      {data === undefined ? <AdminSetupNotice /> : <AiCenterDashboard data={data} />}
    </>
  );
}
