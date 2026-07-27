import {
  AdminFormFeedback,
  AdminPageHeader,
  AdminSetupNotice,
} from '@/components/admin/admin-page-primitives';
import { AiCenterNavigation } from '@/components/ai-center/ai-center-navigation';
import { AiSettingsPanel } from '@/components/ai-center/ai-settings-panel';
import { getAiCenterData } from '@/server/ai/queries';

type AiSettingsPageProps = Readonly<{
  readonly searchParams: Promise<Readonly<Record<string, string | string[] | undefined>>>;
}>;

export default async function AiSettingsPage({
  searchParams,
}: AiSettingsPageProps): Promise<React.JSX.Element> {
  const [data, params] = await Promise.all([getAiCenterData(), searchParams]);

  return (
    <>
      <AdminPageHeader
        description="模型密钥由服务端环境变量管理；这里仅选择模型、优先级、Token 上限和未来通知渠道。"
        eyebrow="AI / SETTINGS"
        title="模型与通知"
      />
      <AiCenterNavigation current="/admin/ai/settings" />
      <AdminFormFeedback error={params['error']} success={params['success']} />
      {data === undefined ? (
        <AdminSetupNotice />
      ) : (
        <AiSettingsPanel
          modelConfigs={data.modelConfigs}
          notificationChannels={data.notificationChannels}
        />
      )}
    </>
  );
}
