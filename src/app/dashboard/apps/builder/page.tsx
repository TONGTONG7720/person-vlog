import type { Metadata } from 'next';

import { AiAppBuilder } from '@/components/saas/ai-app-builder';
import type {
  AiAppBuilderConfiguration,
  AiAppBuilderDraft,
  AiAppBuilderExistingApp,
  AiAppBuilderTemplate,
} from '@/components/saas/ai-app-types';
import { ClientPortalHeader } from '@/components/saas/client-portal-header';
import { requireSaasContext } from '@/server/saas/auth';
import {
  getAiNativeAppAccessSubjects,
  getAiNativeAppForBuilder,
  getAiNativeAppOverview,
} from '@/server/saas/ai-native-apps';
import {
  createAiNativeAppRequestSchema,
  type CreateAiNativeAppInput,
} from '@/server/saas/ai-native-app-validation';
import { hasSaasPermission, saasPermissions } from '@/server/saas/rbac';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  robots: { follow: false, index: false },
  title: 'Tong AI App Builder',
};

type AiAppBuilderPageProps = Readonly<{
  readonly searchParams: Promise<
    Readonly<{
      readonly app?: string | readonly string[];
      readonly organization?: string | readonly string[];
      readonly template?: string | readonly string[];
    }>
  >;
}>;

export default async function AiAppBuilderPage({
  searchParams,
}: AiAppBuilderPageProps): Promise<React.JSX.Element> {
  const query = await searchParams;
  const organizationSlug = typeof query.organization === 'string' ? query.organization : undefined;
  const appId = typeof query.app === 'string' ? query.app : undefined;
  const templateKey = typeof query.template === 'string' ? query.template : undefined;
  const context = await requireSaasContext(organizationSlug);
  const overview = await getAiNativeAppOverview(context);
  const canManage = hasSaasPermission(context.membership.role, saasPermissions.aiManage);

  if (overview === undefined) {
    return <BuilderSetupState context={context} />;
  }

  if (!canManage) {
    return <BuilderPermissionState context={context} />;
  }

  const [accessSubjects, selectedApp] = await Promise.all([
    getAiNativeAppAccessSubjects(context),
    appId === undefined ? Promise.resolve(null) : getAiNativeAppForBuilder(context, appId),
  ]);
  const workspaceId = overview.workspaces[0]?.id;
  const existingApp = toBuilderExistingApp(selectedApp);

  return (
    <div className="saas-portal-shell">
      <ClientPortalHeader
        currentPath="/dashboard/apps"
        email={context.user.email}
        organization={context.organization}
        organizations={context.organizations}
      />
      <main className="saas-client-main">
        <div className="saas-client-page-content ai-app-builder-page-content">
          {workspaceId === undefined ? (
            <p className="saas-empty-state">
              请先在 AI Platform 中创建一个 AI Workspace，再创建应用。应用始终属于一个当前企业的
              Workspace。
            </p>
          ) : (
            <AiAppBuilder
              accessSubjects={accessSubjects}
              canManage={canManage}
              {...(existingApp === undefined ? {} : { existingApp })}
              {...(templateKey === undefined ? {} : { initialTemplateKey: templateKey })}
              organizationSlug={context.organization.slug}
              templates={overview.templates.flatMap((template) => {
                const mapped = toBuilderTemplate(template, workspaceId);
                return mapped === undefined ? [] : [mapped];
              })}
              tools={overview.tools}
              workspaces={overview.workspaces}
            />
          )}
        </div>
      </main>
    </div>
  );
}

function BuilderSetupState({
  context,
}: Readonly<{
  readonly context: Awaited<ReturnType<typeof requireSaasContext>>;
}>): React.JSX.Element {
  return (
    <div className="saas-portal-shell">
      <ClientPortalHeader
        currentPath="/dashboard/apps"
        email={context.user.email}
        organization={context.organization}
        organizations={context.organizations}
      />
      <main className="saas-client-main">
        <div className="saas-client-page-content">
          <p className="saas-empty-state">CMS 数据库尚未连接，暂时无法加载 AI 应用构建器。</p>
        </div>
      </main>
    </div>
  );
}

function BuilderPermissionState({
  context,
}: Readonly<{
  readonly context: Awaited<ReturnType<typeof requireSaasContext>>;
}>): React.JSX.Element {
  return (
    <div className="saas-portal-shell">
      <ClientPortalHeader
        currentPath="/dashboard/apps"
        email={context.user.email}
        organization={context.organization}
        organizations={context.organizations}
      />
      <main className="saas-client-main">
        <div className="saas-client-page-content">
          <p className="saas-empty-state">当前角色没有 ai.manage 权限，不能进入应用构建器。</p>
        </div>
      </main>
    </div>
  );
}

function toBuilderTemplate(
  template: Readonly<{
    readonly blocks: unknown;
    readonly category: string;
    readonly config: unknown;
    readonly description: string;
    readonly key: string;
    readonly name: string;
    readonly type: string;
    readonly workflow: unknown;
  }>,
  workspaceId: string,
): AiAppBuilderTemplate | undefined {
  const parsed = createAiNativeAppRequestSchema.safeParse({
    accessRules: [{ kind: 'ALL_MEMBERS' }],
    blocks: template.blocks,
    config: template.config,
    description: template.description,
    name: template.name,
    slug: `${template.key}-template`,
    templateKey: template.key,
    type: template.type,
    workflow: template.workflow,
    workspaceId,
  });

  return parsed.success
    ? {
        blocks: parsed.data.blocks,
        category: template.category,
        config: toBuilderConfiguration(parsed.data.config),
        description: template.description,
        key: template.key,
        name: template.name,
        type: parsed.data.type,
        workflow: parsed.data.workflow,
      }
    : undefined;
}

function toBuilderExistingApp(
  app: Awaited<ReturnType<typeof getAiNativeAppForBuilder>>,
): AiAppBuilderExistingApp | undefined {
  if (app === null) {
    return undefined;
  }

  const parsed = createAiNativeAppRequestSchema.safeParse({
    accessRules: app.accessRules.map((rule) =>
      rule.subject === null ? { kind: rule.kind } : { kind: rule.kind, subject: rule.subject },
    ),
    blocks: app.blocks,
    config: app.config,
    description: app.description ?? undefined,
    name: app.name,
    slug: app.slug,
    ...(app.template === null ? {} : { templateKey: app.template.key }),
    type: app.type,
    workflow: {
      edges: app.workflow?.edges ?? [],
      nodes: app.workflow?.nodes ?? [],
    },
    workspaceId: app.workspaceId,
  });

  return parsed.success
    ? {
        activeEnvironment: app.activeEnvironment,
        draft: toBuilderDraft(parsed.data),
        id: app.id,
        published: app.published,
        status: app.status,
        updatedAt: app.updatedAt.toISOString(),
        versions: app.versions.map((version) => ({
          createdAt: version.createdAt.toISOString(),
          environment: version.environment,
          version: version.version,
        })),
      }
    : undefined;
}

function toBuilderDraft(input: CreateAiNativeAppInput): AiAppBuilderDraft {
  const draft = {
    accessRules: input.accessRules,
    blocks: input.blocks,
    config: toBuilderConfiguration(input.config),
    description: input.description ?? '',
    name: input.name,
    slug: input.slug,
    type: input.type,
    workflow: input.workflow,
    workspaceId: input.workspaceId,
  };

  return input.templateKey === undefined ? draft : { ...draft, templateKey: input.templateKey };
}

function toBuilderConfiguration(
  configuration: CreateAiNativeAppInput['config'],
): AiAppBuilderConfiguration {
  return {
    model: configuration.model,
    similarityThreshold: configuration.similarityThreshold ?? 0.12,
    systemPrompt: configuration.systemPrompt,
    temperature: configuration.temperature ?? 0.2,
    toolKeys: configuration.toolKeys ?? [],
    topK: configuration.topK ?? 5,
    welcomeMessage:
      configuration.welcomeMessage ?? '你好，我可以帮助你处理当前企业空间内的已授权问题。',
  };
}
