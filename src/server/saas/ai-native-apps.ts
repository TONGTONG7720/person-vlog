import { getAssistantModelConfiguration } from '@/ai/model-config';
import type { AiAppAccessRule } from '@/ai/blocks/contracts';
import {
  AiAppEnvironment,
  AiAppStatus,
  AiUsageChannel,
  AiUsageStatus,
  type PrismaClient,
} from '@/generated/prisma/client';
import { createAiChatResponse, type AiChatResult } from '@/server/saas/ai-chat';
import { isAiNativeAppAccessibleToMembership } from '@/server/saas/ai-native-app-access';
import { AiNativeAppStateError } from '@/server/saas/ai-native-app-errors';
import { toAiNativeAppJsonInput } from '@/server/saas/ai-native-app-json';
import { ensureAiNativeAppTemplates } from '@/server/saas/ai-native-app-templates';
import { AiPlatformInputError } from '@/server/saas/ai-platform-errors';
import { requireSaasPermission, type SaasContext } from '@/server/saas/auth';
import { requirePlanFeature, requirePlanLimit } from '@/server/saas/billing/entitlements';
import { requireCmsDatabase, getCmsDatabase } from '@/server/cms/database';
import { SaasResourceNotFoundError } from '@/server/saas/project-errors';
import { saasPermissions } from '@/server/saas/rbac';
import {
  createAiNativeAppRequestSchema,
  type AiNativeAppLifecycleRequest,
  type CreateAiNativeAppInput,
  type UpdateAiNativeAppInput,
} from '@/server/saas/ai-native-app-validation';

const aiAppTemplateSelect = {
  blocks: true,
  category: true,
  config: true,
  description: true,
  id: true,
  key: true,
  name: true,
  type: true,
  workflow: true,
} as const;

const aiNativeAppInclude = {
  accessRules: true,
  assistant: {
    select: { enabled: true, id: true, model: true, name: true, workspaceId: true },
  },
  template: { select: aiAppTemplateSelect },
  versions: { orderBy: { createdAt: 'desc' }, take: 12 },
  workflow: { select: { edges: true, id: true, name: true, nodes: true } },
  workspace: { select: { id: true, name: true, slug: true } },
} as const;

export async function getAiNativeAppOverview(context: SaasContext) {
  requireSaasPermission(context, saasPermissions.aiUse);
  const database = getCmsDatabase();

  if (database === undefined) {
    return undefined;
  }

  await ensureAiNativeAppTemplates(database);
  const tenantWhere = {
    enterpriseId: context.enterprise.id,
    organizationId: context.organization.id,
  };
  const analyticsPeriodStart = getAiNativeAppAnalyticsPeriodStart();
  const [apps, templates, workspaces, tools, usageRecords] = await Promise.all([
    database.aiApp.findMany({
      include: aiNativeAppInclude,
      orderBy: { updatedAt: 'desc' },
      where: tenantWhere,
    }),
    database.aiAppTemplate.findMany({
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      select: aiAppTemplateSelect,
      where: { enabled: true },
    }),
    database.aiWorkspace.findMany({
      orderBy: { updatedAt: 'desc' },
      select: { id: true, name: true, slug: true },
      where: tenantWhere,
    }),
    database.aiTool.findMany({
      orderBy: { key: 'asc' },
      select: { description: true, key: true, name: true, riskLevel: true },
      where: { ...tenantWhere, enabled: true },
    }),
    database.aiAssistantUsageLog.findMany({
      select: {
        actorMembershipId: true,
        assistantId: true,
        costMicros: true,
        inputTokens: true,
        outputTokens: true,
        status: true,
      },
      where: {
        channel: AiUsageChannel.APP,
        createdAt: { gte: analyticsPeriodStart },
        enterpriseId: context.enterprise.id,
        organizationId: context.organization.id,
      },
    }),
  ]);

  return {
    analytics: createAiNativeAppAnalytics(apps, usageRecords),
    apps,
    templates,
    tools,
    workspaces,
  };
}

export async function getAiNativeAppAccessSubjects(context: SaasContext) {
  requireSaasPermission(context, saasPermissions.aiManage);
  const database = requireCmsDatabase();
  const tenantWhere = {
    enterpriseId: context.enterprise.id,
    organizationId: context.organization.id,
  };
  const [departments, memberships] = await Promise.all([
    database.department.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true },
      where: tenantWhere,
    }),
    database.membership.findMany({
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        role: { select: { key: true } },
        user: { select: { email: true } },
      },
      where: { ...tenantWhere, status: 'ACTIVE' },
    }),
  ]);

  return {
    departments: departments.map((department) => ({ id: department.id, label: department.name })),
    memberships: memberships.map((membership) => ({
      id: membership.id,
      label: `${membership.user.email} · ${membership.role.key}`,
    })),
  };
}

export async function getAiNativeAppForBuilder(context: SaasContext, appId: string) {
  requireSaasPermission(context, saasPermissions.aiManage);
  const database = requireCmsDatabase();

  return database.aiApp.findFirst({
    include: aiNativeAppInclude,
    where: {
      enterpriseId: context.enterprise.id,
      id: appId,
      organizationId: context.organization.id,
    },
  });
}

export async function getAiNativeAppMarketplace(context: SaasContext) {
  requireSaasPermission(context, saasPermissions.aiUse);
  const database = requireCmsDatabase();
  const apps = await database.aiApp.findMany({
    include: {
      accessRules: true,
      workspace: { select: { name: true } },
    },
    orderBy: [{ publishedAt: 'desc' }, { updatedAt: 'desc' }],
    where: {
      enterpriseId: context.enterprise.id,
      organizationId: context.organization.id,
      published: true,
      status: AiAppStatus.PUBLISHED,
    },
  });

  return apps.filter((app) =>
    isAiNativeAppAccessibleToMembership(toAiAppAccessRules(app.accessRules), context.membership),
  );
}

export async function getPublishedAiNativeApp(context: SaasContext, slug: string) {
  requireSaasPermission(context, saasPermissions.aiUse);
  const database = requireCmsDatabase();
  const app = await database.aiApp.findFirst({
    include: {
      accessRules: true,
      assistant: {
        select: { id: true, model: true, name: true, workspace: { select: { name: true } } },
      },
      workspace: { select: { name: true } },
    },
    where: {
      enterpriseId: context.enterprise.id,
      organizationId: context.organization.id,
      published: true,
      slug,
      status: AiAppStatus.PUBLISHED,
    },
  });

  if (
    app === null ||
    !isAiNativeAppAccessibleToMembership(toAiAppAccessRules(app.accessRules), context.membership)
  ) {
    return null;
  }

  return app;
}

export async function createAiNativeApp(context: SaasContext, input: CreateAiNativeAppInput) {
  requireSaasPermission(context, saasPermissions.aiManage);
  await requirePlanFeature(context, 'aiWorkspace');
  const database = requireCmsDatabase();
  await ensureAiNativeAppTemplates(database);
  const [workspace, template, appCount] = await Promise.all([
    database.aiWorkspace.findFirst({
      select: { id: true },
      where: {
        enterpriseId: context.enterprise.id,
        id: input.workspaceId,
        organizationId: context.organization.id,
      },
    }),
    input.templateKey === undefined
      ? Promise.resolve(null)
      : database.aiAppTemplate.findFirst({
          select: { id: true },
          where: { enabled: true, key: input.templateKey },
        }),
    database.aiApp.count({
      where: {
        enterpriseId: context.enterprise.id,
        organizationId: context.organization.id,
      },
    }),
  ]);

  if (workspace === null || (input.templateKey !== undefined && template === null)) {
    throw new SaasResourceNotFoundError();
  }

  await requirePlanLimit(context, 'aiApps', appCount);
  await validateAiAppAccessRuleSubjects(database, context, input.accessRules);
  const configuration = normalizeAiAppConfiguration(input.config);

  return database.$transaction(async (transaction) => {
    const workflow = await transaction.aiWorkflow.create({
      data: {
        description: `由 AI App「${input.name}」维护的可视化工作流。`,
        edges: toAiNativeAppJsonInput(input.workflow.edges),
        enabled: false,
        enterpriseId: context.enterprise.id,
        name: createWorkflowName(input.name),
        nodes: toAiNativeAppJsonInput(input.workflow.nodes),
        organizationId: context.organization.id,
        workspaceId: workspace.id,
      },
    });
    const assistant = await transaction.aiAssistant.create({
      data: {
        description: input.description ?? null,
        enabled: false,
        enterpriseId: context.enterprise.id,
        model: configuration.model,
        name: input.name,
        organizationId: context.organization.id,
        similarityThreshold: configuration.similarityThreshold,
        slug: `app-${input.slug}`,
        systemPrompt: configuration.systemPrompt,
        temperature: configuration.temperature,
        topK: configuration.topK,
        workspaceId: workspace.id,
      },
    });
    const app = await transaction.aiApp.create({
      data: {
        accessRules: { create: toAiAppAccessRuleCreateData(input.accessRules) },
        activeEnvironment: AiAppEnvironment.DEVELOPMENT,
        assistantId: assistant.id,
        blocks: toAiNativeAppJsonInput(input.blocks),
        config: toAiNativeAppJsonInput(configuration),
        description: input.description ?? null,
        enterpriseId: context.enterprise.id,
        name: input.name,
        organizationId: context.organization.id,
        slug: input.slug,
        status: AiAppStatus.DRAFT,
        templateId: template?.id ?? null,
        type: input.type,
        workflowId: workflow.id,
        workspaceId: workspace.id,
      },
    });

    await transaction.aiAppVersion.create({
      data: {
        appId: app.id,
        blocks: toAiNativeAppJsonInput(input.blocks),
        config: toAiNativeAppJsonInput(configuration),
        environment: AiAppEnvironment.DEVELOPMENT,
        version: 'v1',
        workflow: toAiNativeAppJsonInput(input.workflow),
      },
    });

    return app;
  });
}

export async function updateAiNativeApp(
  context: SaasContext,
  appId: string,
  patch: UpdateAiNativeAppInput,
) {
  requireSaasPermission(context, saasPermissions.aiManage);
  const database = requireCmsDatabase();
  const app = await getRequiredManagedAiNativeApp(database, context, appId);

  if (app.status === AiAppStatus.ARCHIVED) {
    throw new AiNativeAppStateError('已归档的 AI 应用需要先恢复为草稿后才能编辑。');
  }

  const candidate = createAiNativeAppRequestSchema.safeParse({
    accessRules:
      patch.accessRules ??
      app.accessRules.map((rule) => ({
        kind: rule.kind,
        ...(rule.subject === null ? {} : { subject: rule.subject }),
      })),
    blocks: patch.blocks ?? app.blocks,
    config: patch.config ?? app.config,
    description: patch.description ?? app.description ?? undefined,
    name: patch.name ?? app.name,
    slug: patch.slug ?? app.slug,
    templateKey: patch.templateKey ?? app.template?.key ?? undefined,
    type: patch.type ?? app.type,
    workflow: patch.workflow ?? {
      edges: app.workflow?.edges ?? [],
      nodes: app.workflow?.nodes ?? [],
    },
    workspaceId: app.workspaceId,
  });

  if (!candidate.success) {
    throw new AiPlatformInputError('AI 应用配置不完整或包含无效的工作流连接。');
  }

  const input = candidate.data;
  await ensureAiNativeAppTemplates(database);
  const template =
    input.templateKey === undefined
      ? null
      : await database.aiAppTemplate.findFirst({
          select: { id: true },
          where: { enabled: true, key: input.templateKey },
        });

  if (input.templateKey !== undefined && template === null) {
    throw new SaasResourceNotFoundError();
  }

  await validateAiAppAccessRuleSubjects(database, context, input.accessRules);
  const configuration = normalizeAiAppConfiguration(input.config);

  return database.$transaction(async (transaction) => {
    if (app.assistantId !== null) {
      await transaction.aiAssistant.update({
        data: {
          description: input.description ?? null,
          model: configuration.model,
          name: input.name,
          similarityThreshold: configuration.similarityThreshold,
          systemPrompt: configuration.systemPrompt,
          temperature: configuration.temperature,
          topK: configuration.topK,
        },
        where: { id: app.assistantId },
      });
    }

    if (app.workflowId !== null) {
      await transaction.aiWorkflow.update({
        data: {
          description: `由 AI App「${input.name}」维护的可视化工作流。`,
          edges: toAiNativeAppJsonInput(input.workflow.edges),
          name: createWorkflowName(input.name),
          nodes: toAiNativeAppJsonInput(input.workflow.nodes),
        },
        where: { id: app.workflowId },
      });
    }

    await transaction.aiAppAccessRule.deleteMany({ where: { appId: app.id } });
    await transaction.aiAppAccessRule.createMany({
      data: toAiAppAccessRuleCreateData(input.accessRules).map((rule) => ({
        ...rule,
        appId: app.id,
      })),
    });

    return transaction.aiApp.update({
      data: {
        blocks: toAiNativeAppJsonInput(input.blocks),
        config: toAiNativeAppJsonInput(configuration),
        description: input.description ?? null,
        name: input.name,
        slug: input.slug,
        templateId: template?.id ?? app.templateId,
        type: input.type,
      },
      where: { id: app.id },
    });
  });
}

export async function transitionAiNativeAppLifecycle(
  context: SaasContext,
  appId: string,
  request: AiNativeAppLifecycleRequest,
) {
  requireSaasPermission(context, saasPermissions.aiManage);
  const database = requireCmsDatabase();
  const app = await getRequiredManagedAiNativeApp(database, context, appId);
  const target = getAiNativeAppLifecycleTarget(app.status, request.action);
  const shouldSnapshot = request.action === 'save-draft' || request.action === 'publish';
  const version = shouldSnapshot
    ? (request.version ?? getNextAiAppVersion(app.versions))
    : undefined;

  if (version !== undefined && app.versions.some((item) => item.version === version)) {
    throw new AiNativeAppStateError('该 AI App 版本已经存在，请选择一个新的版本号。');
  }

  return database.$transaction(async (transaction) => {
    const updated = await transaction.aiApp.update({
      data: {
        activeEnvironment: target.environment,
        published: target.published,
        publishedAt: target.published ? new Date() : null,
        status: target.status,
      },
      where: { id: app.id },
    });

    if (app.assistantId !== null) {
      await transaction.aiAssistant.update({
        data: { enabled: target.assistantEnabled },
        where: { id: app.assistantId },
      });
    }

    if (app.workflowId !== null) {
      await transaction.aiWorkflow.update({
        data: { enabled: target.assistantEnabled },
        where: { id: app.workflowId },
      });
    }

    if (version !== undefined) {
      await transaction.aiAppVersion.create({
        data: {
          appId: app.id,
          blocks: toAiNativeAppJsonInput(app.blocks),
          config: toAiNativeAppJsonInput(app.config),
          environment: target.environment,
          version,
          workflow: toAiNativeAppJsonInput({
            edges: app.workflow?.edges ?? [],
            nodes: app.workflow?.nodes ?? [],
          }),
        },
      });
    }

    return updated;
  });
}

export async function createAiNativeAppSandboxResponse(
  context: SaasContext,
  appId: string,
  message: string,
): Promise<AiChatResult> {
  requireSaasPermission(context, saasPermissions.aiManage);
  const database = requireCmsDatabase();
  const app = await getRequiredManagedAiNativeApp(database, context, appId);

  if (app.status !== AiAppStatus.TESTING && app.status !== AiAppStatus.PUBLISHED) {
    throw new AiNativeAppStateError('请先将 AI 应用切换到测试环境，再进行 Sandbox 对话。');
  }

  if (app.assistantId === null) {
    throw new AiNativeAppStateError('该 AI 应用尚未生成可运行的助手。');
  }

  return createAiChatResponse({
    assistantId: app.assistantId,
    actorMembershipId: context.membership.id,
    channel: 'APP',
    enterpriseId: context.enterprise.id,
    message,
    organizationId: context.organization.id,
    role: context.membership.role,
  });
}

export async function createPublishedAiNativeAppResponse(
  context: SaasContext,
  slug: string,
  message: string,
): Promise<AiChatResult> {
  const app = await getPublishedAiNativeApp(context, slug);

  if (app === null || app.assistant === null) {
    throw new SaasResourceNotFoundError();
  }

  return createAiChatResponse({
    assistantId: app.assistant.id,
    actorMembershipId: context.membership.id,
    channel: 'APP',
    enterpriseId: context.enterprise.id,
    message,
    organizationId: context.organization.id,
    role: context.membership.role,
  });
}

export async function createApiKeyAiNativeAppResponse(
  input: Readonly<{
    readonly appId: string;
    readonly enterpriseId: string;
    readonly message: string;
    readonly organizationId: string;
  }>,
): Promise<AiChatResult> {
  const database = requireCmsDatabase();
  const app = await database.aiApp.findFirst({
    include: { accessRules: true, assistant: { select: { id: true } } },
    where: {
      enterpriseId: input.enterpriseId,
      id: input.appId,
      organizationId: input.organizationId,
      published: true,
      status: AiAppStatus.PUBLISHED,
    },
  });

  if (
    app === null ||
    app.assistant === null ||
    !app.accessRules.some((rule) => rule.kind === 'ALL_MEMBERS')
  ) {
    throw new SaasResourceNotFoundError();
  }

  return createAiChatResponse({
    assistantId: app.assistant.id,
    channel: 'API',
    enterpriseId: input.enterpriseId,
    message: input.message,
    organizationId: input.organizationId,
    role: undefined,
  });
}

function normalizeAiAppConfiguration(input: CreateAiNativeAppInput['config']) {
  const configuredModel = getAssistantModelConfiguration();

  return {
    ...input,
    model:
      input.model === 'enterprise-default' && configuredModel.kind === 'available'
        ? configuredModel.model
        : input.model,
  };
}

async function getRequiredManagedAiNativeApp(
  database: PrismaClient,
  context: SaasContext,
  appId: string,
) {
  const app = await database.aiApp.findFirst({
    include: aiNativeAppInclude,
    where: {
      enterpriseId: context.enterprise.id,
      id: appId,
      organizationId: context.organization.id,
    },
  });

  if (app === null) {
    throw new SaasResourceNotFoundError();
  }

  return app;
}

function toAiAppAccessRuleCreateData(rules: CreateAiNativeAppInput['accessRules']): Array<{
  kind: 'ALL_MEMBERS' | 'DEPARTMENT' | 'MEMBERSHIP' | 'ROLE';
  subject?: string;
}> {
  return rules.map((rule) =>
    rule.kind === 'ALL_MEMBERS' ? { kind: rule.kind } : { kind: rule.kind, subject: rule.subject },
  );
}

function toAiAppAccessRules(
  rules: readonly Readonly<{ readonly kind: string; readonly subject: string | null }>[],
): readonly AiAppAccessRule[] {
  const result: AiAppAccessRule[] = [];

  for (const rule of rules) {
    switch (rule.kind) {
      case 'ALL_MEMBERS':
        result.push({ kind: 'ALL_MEMBERS' });
        break;
      case 'ROLE':
        if (rule.subject !== null) {
          result.push({ kind: 'ROLE', subject: rule.subject });
        }
        break;
      case 'DEPARTMENT':
        if (rule.subject !== null) {
          result.push({ kind: 'DEPARTMENT', subject: rule.subject });
        }
        break;
      case 'MEMBERSHIP':
        if (rule.subject !== null) {
          result.push({ kind: 'MEMBERSHIP', subject: rule.subject });
        }
        break;
      default:
        break;
    }
  }

  return result;
}

async function validateAiAppAccessRuleSubjects(
  database: PrismaClient,
  context: SaasContext,
  rules: readonly AiAppAccessRule[],
): Promise<void> {
  const departmentIds = rules.flatMap((rule) => (rule.kind === 'DEPARTMENT' ? [rule.subject] : []));
  const membershipIds = rules.flatMap((rule) => (rule.kind === 'MEMBERSHIP' ? [rule.subject] : []));

  const [departments, memberships] = await Promise.all([
    departmentIds.length === 0
      ? Promise.resolve([])
      : database.department.findMany({
          select: { id: true },
          where: {
            enterpriseId: context.enterprise.id,
            id: { in: departmentIds },
            organizationId: context.organization.id,
          },
        }),
    membershipIds.length === 0
      ? Promise.resolve([])
      : database.membership.findMany({
          select: { id: true },
          where: {
            enterpriseId: context.enterprise.id,
            id: { in: membershipIds },
            organizationId: context.organization.id,
            status: 'ACTIVE',
          },
        }),
  ]);

  if (departments.length !== departmentIds.length || memberships.length !== membershipIds.length) {
    throw new SaasResourceNotFoundError();
  }
}

function createAiNativeAppAnalytics(
  apps: readonly Readonly<{
    readonly assistant: Readonly<{ readonly id: string }> | null;
    readonly id: string;
  }>[],
  usageRecords: readonly Readonly<{
    readonly actorMembershipId: string | null;
    readonly assistantId: string | null;
    readonly costMicros: number;
    readonly inputTokens: number;
    readonly outputTokens: number;
    readonly status: AiUsageStatus;
  }>[],
) {
  const appIdByAssistantId = new Map(
    apps.flatMap((app) => (app.assistant === null ? [] : [[app.assistant.id, app.id] as const])),
  );
  const perApp = new Map<string, AiNativeAppAnalyticsAccumulator>();
  const activeMemberIds = new Set<string>();

  for (const record of usageRecords) {
    if (record.assistantId === null) {
      continue;
    }

    const appId = appIdByAssistantId.get(record.assistantId);

    if (appId === undefined) {
      continue;
    }

    const accumulator = perApp.get(appId) ?? createAiNativeAppAnalyticsAccumulator();
    accumulator.costMicros += record.costMicros;
    accumulator.requestCount += 1;
    accumulator.tokenCount += record.inputTokens + record.outputTokens;
    accumulator.failedRequestCount += record.status === AiUsageStatus.FAILED ? 1 : 0;

    if (record.actorMembershipId !== null) {
      accumulator.activeMemberIds.add(record.actorMembershipId);
      activeMemberIds.add(record.actorMembershipId);
    }

    perApp.set(appId, accumulator);
  }

  const entries = apps.map((app) => {
    const metrics = perApp.get(app.id) ?? createAiNativeAppAnalyticsAccumulator();

    return {
      activeUserCount: metrics.activeMemberIds.size,
      appId: app.id,
      costMicros: metrics.costMicros,
      failureRate:
        metrics.requestCount === 0 ? 0 : metrics.failedRequestCount / metrics.requestCount,
      requestCount: metrics.requestCount,
      tokenCount: metrics.tokenCount,
    };
  });
  const total = entries.reduce(
    (result, entry) => ({
      costMicros: result.costMicros + entry.costMicros,
      failedRequestCount:
        result.failedRequestCount + Math.round(entry.failureRate * entry.requestCount),
      requestCount: result.requestCount + entry.requestCount,
      tokenCount: result.tokenCount + entry.tokenCount,
    }),
    { costMicros: 0, failedRequestCount: 0, requestCount: 0, tokenCount: 0 },
  );

  return {
    activeUserCount: activeMemberIds.size,
    appMetrics: entries,
    costMicros: total.costMicros,
    failureRate: total.requestCount === 0 ? 0 : total.failedRequestCount / total.requestCount,
    requestCount: total.requestCount,
    tokenCount: total.tokenCount,
  };
}

type AiNativeAppAnalyticsAccumulator = {
  activeMemberIds: Set<string>;
  costMicros: number;
  failedRequestCount: number;
  requestCount: number;
  tokenCount: number;
};

function createAiNativeAppAnalyticsAccumulator(): AiNativeAppAnalyticsAccumulator {
  return {
    activeMemberIds: new Set<string>(),
    costMicros: 0,
    failedRequestCount: 0,
    requestCount: 0,
    tokenCount: 0,
  };
}

function getAiNativeAppAnalyticsPeriodStart(): Date {
  const date = new Date();
  date.setDate(date.getDate() - 30);

  return date;
}

function createWorkflowName(appName: string): string {
  return `${appName} · 应用流程`;
}

function getNextAiAppVersion(versions: readonly Readonly<{ readonly version: string }>[]): string {
  const latestVersion = versions.at(0)?.version;

  if (latestVersion === undefined) {
    return 'v1';
  }

  const matched = /^v(\d+)(?:\.(\d+))?$/u.exec(latestVersion);

  if (matched === null) {
    return 'v1.1';
  }

  const major = Number(matched[1]);
  const minor = Number(matched[2] ?? '0');

  return `v${major}.${minor + 1}`;
}

function getAiNativeAppLifecycleTarget(
  currentStatus: AiAppStatus,
  action: AiNativeAppLifecycleRequest['action'],
) {
  switch (action) {
    case 'save-draft':
      if (currentStatus === AiAppStatus.ARCHIVED) {
        throw new AiNativeAppStateError('请先恢复已归档的 AI 应用，再保存草稿。');
      }

      return {
        assistantEnabled: false,
        environment: AiAppEnvironment.DEVELOPMENT,
        published: false,
        status: AiAppStatus.DRAFT,
      };
    case 'start-testing':
      if (currentStatus === AiAppStatus.ARCHIVED) {
        throw new AiNativeAppStateError('已归档的 AI 应用不能直接进入测试环境。');
      }

      return {
        assistantEnabled: true,
        environment: AiAppEnvironment.DEVELOPMENT,
        published: false,
        status: AiAppStatus.TESTING,
      };
    case 'publish':
      if (currentStatus !== AiAppStatus.TESTING) {
        throw new AiNativeAppStateError('AI 应用需要先通过测试环境，再发布到生产环境。');
      }

      return {
        assistantEnabled: true,
        environment: AiAppEnvironment.PRODUCTION,
        published: true,
        status: AiAppStatus.PUBLISHED,
      };
    case 'archive':
      return {
        assistantEnabled: false,
        environment: AiAppEnvironment.DEVELOPMENT,
        published: false,
        status: AiAppStatus.ARCHIVED,
      };
    case 'restore-draft':
      if (currentStatus !== AiAppStatus.ARCHIVED) {
        throw new AiNativeAppStateError('只有已归档的 AI 应用可以恢复为草稿。');
      }

      return {
        assistantEnabled: false,
        environment: AiAppEnvironment.DEVELOPMENT,
        published: false,
        status: AiAppStatus.DRAFT,
      };
  }
}
