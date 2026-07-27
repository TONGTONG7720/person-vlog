import { requireCmsDatabase } from '@/server/cms/database';
import { requireSaasPermission, type SaasContext } from '@/server/saas/auth';
import { requirePlanFeature, requirePlanLimit } from '@/server/saas/billing/entitlements';
import { AiPlatformInputError } from '@/server/saas/ai-platform-errors';
import { SaasResourceNotFoundError } from '@/server/saas/project-errors';
import { hasSaasPermission, saasPermissions } from '@/server/saas/rbac';
import type { CreateAiAssistantInput, CreateAiWorkspaceInput } from '@/server/saas/validation';

export async function getSaasAiPlatformOverview(context: SaasContext) {
  requireSaasPermission(context, saasPermissions.aiUse);
  const database = requireCmsDatabase();
  const enterpriseId = context.enterprise.id;
  const organizationId = context.organization.id;
  const [workspaces, templates, apiKeys, usage] = await Promise.all([
    database.aiWorkspace.findMany({
      include: {
        _count: { select: { assistants: true, documents: true } },
        assistants: {
          orderBy: { updatedAt: 'desc' },
          select: { enabled: true, id: true, model: true, name: true, slug: true, updatedAt: true },
          take: 6,
        },
      },
      orderBy: { updatedAt: 'desc' },
      where: { enterpriseId, organizationId },
    }),
    database.agentTemplate.findMany({
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      where: { enabled: true },
    }),
    hasSaasPermission(context.membership.role, saasPermissions.aiManage)
      ? database.aiApiKey.findMany({
          orderBy: { createdAt: 'desc' },
          select: {
            createdAt: true,
            expiresAt: true,
            id: true,
            lastUsedAt: true,
            name: true,
            prefix: true,
            revokedAt: true,
            scopes: true,
          },
          take: 12,
          where: { enterpriseId, organizationId },
        })
      : Promise.resolve([]),
    database.aiAssistantUsageLog.aggregate({
      _count: { _all: true },
      _sum: { costMicros: true, inputTokens: true, outputTokens: true },
      where: { enterpriseId, organizationId },
    }),
  ]);

  return { apiKeys, templates, usage, workspaces };
}

export async function getSaasAiAssistant(context: SaasContext, assistantId: string) {
  requireSaasPermission(context, saasPermissions.aiUse);
  const database = requireCmsDatabase();

  return database.aiAssistant.findFirst({
    include: {
      workspace: { select: { id: true, name: true, slug: true } },
    },
    where: {
      enterpriseId: context.enterprise.id,
      id: assistantId,
      organizationId: context.organization.id,
    },
  });
}

export async function createSaasAiWorkspace(context: SaasContext, input: CreateAiWorkspaceInput) {
  requireSaasPermission(context, saasPermissions.aiManage);
  await requirePlanFeature(context, 'aiWorkspace');
  const database = requireCmsDatabase();
  const workspaceCount = await database.aiWorkspace.count({
    where: { enterpriseId: context.enterprise.id, organizationId: context.organization.id },
  });

  await requirePlanLimit(context, 'workspaces', workspaceCount);

  return database.aiWorkspace.create({
    data: {
      ...(input.description === undefined ? {} : { description: input.description }),
      enterpriseId: context.enterprise.id,
      name: input.name,
      organizationId: context.organization.id,
      slug: input.slug,
    },
  });
}

export async function createSaasAiAssistant(context: SaasContext, input: CreateAiAssistantInput) {
  requireSaasPermission(context, saasPermissions.aiManage);
  await requirePlanFeature(context, 'aiWorkspace');
  const database = requireCmsDatabase();
  const [workspace, template, assistantCount] = await Promise.all([
    database.aiWorkspace.findFirst({
      select: { id: true },
      where: {
        enterpriseId: context.enterprise.id,
        id: input.workspaceId,
        organizationId: context.organization.id,
      },
    }),
    input.templateId === undefined
      ? Promise.resolve(undefined)
      : database.agentTemplate.findFirst({
          select: { id: true, systemPrompt: true },
          where: { enabled: true, id: input.templateId },
        }),
    database.aiAssistant.count({
      where: { enterpriseId: context.enterprise.id, organizationId: context.organization.id },
    }),
  ]);

  if (workspace === null) {
    throw new SaasResourceNotFoundError();
  }

  if (input.templateId !== undefined && template === null) {
    throw new SaasResourceNotFoundError();
  }

  const systemPrompt = input.systemPrompt ?? template?.systemPrompt;

  if (systemPrompt === undefined) {
    throw new AiPlatformInputError('创建助手时必须选择模板或填写系统提示词。');
  }

  await requirePlanLimit(context, 'aiAssistants', assistantCount);

  return database.$transaction(async (transaction) => {
    const assistant = await transaction.aiAssistant.create({
      data: {
        ...(input.description === undefined ? {} : { description: input.description }),
        ...(input.templateId === undefined ? {} : { templateId: input.templateId }),
        enterpriseId: context.enterprise.id,
        model: input.model,
        name: input.name,
        organizationId: context.organization.id,
        similarityThreshold: input.similarityThreshold,
        slug: input.slug,
        systemPrompt,
        temperature: input.temperature,
        topK: input.topK,
        workspaceId: workspace.id,
      },
    });

    await transaction.aiPromptVersion.create({
      data: { assistantId: assistant.id, content: systemPrompt, version: 1 },
    });

    return assistant;
  });
}
