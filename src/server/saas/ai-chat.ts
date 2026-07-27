import { AiUsageChannel, AiUsageStatus } from '@/generated/prisma/client';
import { estimateDocumentTokens } from '@/ai/document/chunker';
import { isSafeAiAutomationInput } from '@/ai/lib/automation-safety';
import { getAssistantModelConfiguration } from '@/ai/model-config';
import { AssistantModelError, streamAssistantModel } from '@/ai/model-stream';
import { requireCmsDatabase } from '@/server/cms/database';
import { consumeMeteredPlanUsage } from '@/server/saas/billing/usage';
import {
  AiPlatformInputError,
  AiPlatformModelUnavailableError,
} from '@/server/saas/ai-platform-errors';
import {
  buildAiAssistantRagPrompt,
  retrieveAiWorkspaceKnowledge,
  type AiKnowledgeSource,
} from '@/server/saas/ai-rag';
import { SaasResourceNotFoundError } from '@/server/saas/project-errors';
import type { SaasRole } from '@/server/saas/rbac';

const maximumAiChatOutputTokens = 800;

export type AiChatChannel = 'API' | 'APP' | 'DASHBOARD';

export type AiChatResult = Readonly<{
  readonly sources: readonly AiKnowledgeSource[];
  readonly stream: ReadableStream<string>;
}>;

type CreateAiChatInput = Readonly<{
  readonly assistantId: string;
  readonly actorMembershipId?: string;
  readonly channel: AiChatChannel;
  readonly enterpriseId: string;
  readonly message: string;
  readonly organizationId: string;
  readonly role: SaasRole | undefined;
}>;

export async function createAiChatResponse(input: CreateAiChatInput): Promise<AiChatResult> {
  if (!isSafeAiAutomationInput(input.message)) {
    throw new AiPlatformInputError('该问题不符合企业 AI 助手的安全边界。');
  }

  const database = requireCmsDatabase();
  const assistant = await database.aiAssistant.findFirst({
    select: {
      id: true,
      model: true,
      organizationId: true,
      similarityThreshold: true,
      systemPrompt: true,
      temperature: true,
      topK: true,
      workspaceId: true,
    },
    where: {
      enabled: true,
      enterpriseId: input.enterpriseId,
      id: input.assistantId,
      organizationId: input.organizationId,
    },
  });

  if (assistant === null) {
    throw new SaasResourceNotFoundError();
  }

  const [knowledge, configuration] = await Promise.all([
    retrieveAiWorkspaceKnowledge({
      enterpriseId: input.enterpriseId,
      organizationId: input.organizationId,
      query: input.message,
      role: input.role,
      similarityThreshold: assistant.similarityThreshold,
      topK: assistant.topK,
      workspaceId: assistant.workspaceId,
    }),
    resolveAssistantModelConfiguration(assistant.model),
  ]);
  const prompt = buildAiAssistantRagPrompt({
    retrievedChunks: knowledge.chunks,
    systemPrompt: assistant.systemPrompt,
  });
  const inputTokens = estimateDocumentTokens(`${prompt}\n${input.message}`);
  const usageContext = { organization: { id: input.organizationId } };

  await Promise.all([
    consumeMeteredPlanUsage(usageContext, 'aiMessages', 1),
    consumeMeteredPlanUsage(usageContext, 'aiTokens', inputTokens + maximumAiChatOutputTokens),
  ]);

  try {
    const stream = await streamAssistantModel(configuration, {
      maxTokens: maximumAiChatOutputTokens,
      messages: [{ content: input.message, role: 'user' }],
      systemPrompt: prompt,
      temperature: assistant.temperature,
    });

    return {
      sources: knowledge.sources,
      stream: recordAiChatUsageStream({
        assistantId: assistant.id,
        ...(input.actorMembershipId === undefined
          ? {}
          : { actorMembershipId: input.actorMembershipId }),
        channel: input.channel,
        enterpriseId: input.enterpriseId,
        inputTokens,
        model: configuration.model,
        organizationId: input.organizationId,
        source: stream,
        workspaceId: assistant.workspaceId,
      }),
    };
  } catch (error) {
    await recordAiChatUsage({
      assistantId: assistant.id,
      ...(input.actorMembershipId === undefined
        ? {}
        : { actorMembershipId: input.actorMembershipId }),
      channel: input.channel,
      enterpriseId: input.enterpriseId,
      inputTokens,
      model: configuration.model,
      organizationId: input.organizationId,
      outputTokens: 0,
      status: AiUsageStatus.FAILED,
      workspaceId: assistant.workspaceId,
    });

    if (
      error instanceof AssistantModelError ||
      error instanceof DOMException ||
      error instanceof TypeError
    ) {
      throw new AiPlatformModelUnavailableError();
    }

    throw error;
  }
}

async function resolveAssistantModelConfiguration(model: string) {
  const configuration = getAssistantModelConfiguration();

  if (configuration.kind === 'disabled') {
    throw new AiPlatformModelUnavailableError();
  }

  const database = requireCmsDatabase();
  const [configuredModel, configuredModelCount] = await Promise.all([
    database.aiModelConfig.findFirst({
      select: { model: true, provider: true },
      where: { enabled: true, model },
    }),
    database.aiModelConfig.count(),
  ]);

  if (
    (configuredModelCount > 0 && configuredModel === null) ||
    (configuredModel !== null && configuredModel.provider !== configuration.provider)
  ) {
    throw new AiPlatformModelUnavailableError();
  }

  return { ...configuration, model };
}

function recordAiChatUsageStream(
  input: Readonly<{
    readonly assistantId: string;
    readonly actorMembershipId?: string;
    readonly channel: AiChatChannel;
    readonly enterpriseId: string;
    readonly inputTokens: number;
    readonly model: string;
    readonly organizationId: string;
    readonly source: ReadableStream<string>;
    readonly workspaceId: string;
  }>,
): ReadableStream<string> {
  return new ReadableStream<string>({
    async start(controller) {
      const reader = input.source.getReader();
      let answer = '';

      try {
        for (;;) {
          const result = await reader.read();

          if (result.done) {
            break;
          }

          answer += result.value;
          controller.enqueue(result.value);
        }

        await recordAiChatUsage({
          assistantId: input.assistantId,
          ...(input.actorMembershipId === undefined
            ? {}
            : { actorMembershipId: input.actorMembershipId }),
          channel: input.channel,
          enterpriseId: input.enterpriseId,
          inputTokens: input.inputTokens,
          model: input.model,
          organizationId: input.organizationId,
          outputTokens: estimateDocumentTokens(answer),
          status: AiUsageStatus.COMPLETED,
          workspaceId: input.workspaceId,
        });
        controller.close();
      } catch (error) {
        await recordAiChatUsage({
          assistantId: input.assistantId,
          ...(input.actorMembershipId === undefined
            ? {}
            : { actorMembershipId: input.actorMembershipId }),
          channel: input.channel,
          enterpriseId: input.enterpriseId,
          inputTokens: input.inputTokens,
          model: input.model,
          organizationId: input.organizationId,
          outputTokens: 0,
          status: AiUsageStatus.FAILED,
          workspaceId: input.workspaceId,
        });
        controller.error(error);
      } finally {
        reader.releaseLock();
      }
    },
  });
}

async function recordAiChatUsage(
  input: Readonly<{
    readonly assistantId: string;
    readonly actorMembershipId?: string;
    readonly channel: AiChatChannel;
    readonly enterpriseId: string;
    readonly inputTokens: number;
    readonly model: string;
    readonly organizationId: string;
    readonly outputTokens: number;
    readonly status: AiUsageStatus;
    readonly workspaceId: string;
  }>,
): Promise<void> {
  const database = requireCmsDatabase();

  await database.aiAssistantUsageLog.create({
    data: {
      assistantId: input.assistantId,
      ...(input.actorMembershipId === undefined
        ? {}
        : { actorMembershipId: input.actorMembershipId }),
      channel:
        input.channel === 'API'
          ? AiUsageChannel.API
          : input.channel === 'APP'
            ? AiUsageChannel.APP
            : AiUsageChannel.DASHBOARD,
      enterpriseId: input.enterpriseId,
      inputTokens: input.inputTokens,
      model: input.model,
      organizationId: input.organizationId,
      outputTokens: input.outputTokens,
      status: input.status,
      workspaceId: input.workspaceId,
    },
  });
}
