import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ArrowLeft, BadgeCheck, LockKeyhole } from 'lucide-react';
import Link from 'next/link';

import { AiAppChat } from '@/components/saas/ai-app-chat';
import { ClientPortalHeader } from '@/components/saas/client-portal-header';
import { requireSaasContext } from '@/server/saas/auth';
import { getPublishedAiNativeApp } from '@/server/saas/ai-native-apps';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  robots: { follow: false, index: false },
  title: 'Tong AI 应用',
};

type AiAppRuntimePageProps = Readonly<{
  readonly params: Promise<Readonly<{ readonly slug: string }>>;
  readonly searchParams: Promise<Readonly<{ readonly organization?: string | readonly string[] }>>;
}>;

export default async function AiAppRuntimePage({
  params,
  searchParams,
}: AiAppRuntimePageProps): Promise<React.JSX.Element> {
  const [route, query] = await Promise.all([params, searchParams]);
  const organizationSlug = typeof query.organization === 'string' ? query.organization : undefined;
  const context = await requireSaasContext(organizationSlug);
  const app = await getPublishedAiNativeApp(context, route.slug);

  if (app === null || app.assistant === null) {
    notFound();
  }

  return (
    <div className="saas-portal-shell">
      <ClientPortalHeader
        currentPath="/app-marketplace"
        email={context.user.email}
        organization={context.organization}
        organizations={context.organizations}
      />
      <main className="saas-client-main">
        <div className="saas-client-page-content ai-app-runtime-page">
          <Link
            className="ai-app-runtime-back"
            href={`/app-marketplace?organization=${encodeURIComponent(context.organization.slug)}`}
          >
            <ArrowLeft aria-hidden="true" size={16} />
            返回企业应用市场
          </Link>
          <section className="ai-app-runtime-hero">
            <div>
              <p className="saas-kicker">PUBLISHED / {app.workspace.name}</p>
              <h1>{app.name}</h1>
              <p>{app.description ?? '这是当前企业已发布的受控 AI 应用。'}</p>
            </div>
            <div>
              <BadgeCheck aria-hidden="true" size={19} />
              <span>已发布</span>
              <LockKeyhole aria-hidden="true" size={17} />
              <span>仅限授权成员</span>
            </div>
          </section>
          <AiAppChat
            description="回答基于当前企业空间的已授权资料生成；资料不足时，应用会明确说明信息边界。"
            endpoint={`/api/v1/ai/apps/runtime/${encodeURIComponent(route.slug)}/chat?organization=${encodeURIComponent(context.organization.slug)}`}
            heading={app.name}
            placeholder={`向 ${app.name} 输入问题…`}
          />
        </div>
      </main>
    </div>
  );
}
