import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { AiAssistantChat } from '@/components/saas/ai-assistant-chat';
import { ClientPortalHeader } from '@/components/saas/client-portal-header';
import { requireSaasContext } from '@/server/saas/auth';
import { getSaasAiAssistant } from '@/server/saas/ai-workspaces';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  robots: { follow: false, index: false },
  title: '企业 AI Assistant',
};

type AiAssistantPageProps = Readonly<{
  readonly params: Promise<Readonly<{ readonly assistantId: string }>>;
  readonly searchParams: Promise<Readonly<{ readonly organization?: string | readonly string[] }>>;
}>;

export default async function AiAssistantPage({
  params,
  searchParams,
}: AiAssistantPageProps): Promise<React.JSX.Element> {
  const [{ assistantId }, query] = await Promise.all([params, searchParams]);
  const organizationSlug = typeof query.organization === 'string' ? query.organization : undefined;
  const context = await requireSaasContext(organizationSlug);
  const assistant = await getSaasAiAssistant(context, assistantId);

  if (assistant === null) {
    notFound();
  }

  return (
    <div className="saas-portal-shell">
      <ClientPortalHeader
        currentPath="/dashboard/ai"
        email={context.user.email}
        organization={context.organization}
        organizations={context.organizations}
      />
      <main className="saas-client-main">
        <div className="saas-client-page-content">
          <AiAssistantChat
            assistantId={assistant.id}
            description={assistant.description}
            model={assistant.model}
            name={assistant.name}
            organizationSlug={context.organization.slug}
            workspaceName={assistant.workspace.name}
          />
        </div>
      </main>
    </div>
  );
}
