import {
  AdminFormFeedback,
  AdminPageHeader,
  AdminSetupNotice,
} from '@/components/admin/admin-page-primitives';
import { AiCenterNavigation } from '@/components/ai-center/ai-center-navigation';
import { AiPromptManager } from '@/components/ai-center/ai-prompt-manager';
import { getAiCenterData } from '@/server/ai/queries';

type AiPromptsPageProps = Readonly<{
  readonly searchParams: Promise<Readonly<Record<string, string | string[] | undefined>>>;
}>;

export default async function AiPromptsPage({
  searchParams,
}: AiPromptsPageProps): Promise<React.JSX.Element> {
  const [data, params] = await Promise.all([getAiCenterData(), searchParams]);

  return (
    <>
      <AdminPageHeader
        description="按版本管理管理员审核的 Agent 补充指令。内置的提示词防护与人工审核边界不会由这里覆盖。"
        eyebrow="AI / PROMPTS"
        title="Prompt 管理"
      />
      <AiCenterNavigation current="/admin/ai/prompts" />
      <AdminFormFeedback error={params['error']} success={params['success']} />
      {data === undefined ? <AdminSetupNotice /> : <AiPromptManager prompts={data.prompts} />}
    </>
  );
}
