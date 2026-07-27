import type { AssistantModelConfiguration } from '@/ai/model-config';
import { getAssistantModelConfiguration } from '@/ai/model-config';
import { AssistantModelError, streamAssistantModel } from '@/ai/model-stream';
import type { AiAutomationAgent } from '@/ai/automation-types';
import { getAiUsageDecision } from '@/ai/usage-limits';
import { AiUsageStatus, type PrismaClient } from '@/generated/prisma/client';
import { logger } from '@/lib/logger';
import { aiAgentTypeToPrisma } from '@/server/ai/mappings';

const minimumTokenBudget = 128;

export type AiGenerationRequest = Readonly<{
  readonly agent: AiAutomationAgent;
  readonly maxTokens: number;
  readonly systemPrompt: string;
  readonly taskPrompt: string;
}>;

export type AiGenerationResult =
  | Readonly<{ readonly kind: 'generated'; readonly text: string }>
  | Readonly<{ readonly kind: 'budget-exceeded' | 'failed' | 'unavailable' }>;

type AiModelSelection = Readonly<{
  readonly configuration: Extract<AssistantModelConfiguration, { readonly kind: 'available' }>;
  readonly dailyLimit: number | null;
  readonly maxTokens: number;
  readonly modelConfigId: string | null;
  readonly monthlyLimit: number | null;
}>;

function estimateTokens(value: string): number {
  return Math.max(1, Math.ceil(Array.from(value).length / 4));
}

function getUtcDayStart(): Date {
  const currentDate = new Date();

  return new Date(
    Date.UTC(currentDate.getUTCFullYear(), currentDate.getUTCMonth(), currentDate.getUTCDate()),
  );
}

function getUtcMonthStart(): Date {
  const currentDate = new Date();

  return new Date(Date.UTC(currentDate.getUTCFullYear(), currentDate.getUTCMonth(), 1));
}

async function readTextStream(stream: ReadableStream<string>): Promise<string> {
  const reader = stream.getReader();
  let content = '';

  try {
    while (true) {
      const chunk = await reader.read();

      if (chunk.done) {
        return content;
      }

      content += chunk.value;
    }
  } finally {
    reader.releaseLock();
  }
}

async function selectAiModel(
  database: PrismaClient,
  requestedTokens: number,
): Promise<AiModelSelection | undefined> {
  const configuration = getAssistantModelConfiguration();

  if (configuration.kind === 'disabled') {
    return undefined;
  }

  const [modelConfig, modelConfigCount] = await Promise.all([
    database.aiModelConfig.findFirst({
      orderBy: { priority: 'asc' },
      where: { enabled: true },
    }),
    database.aiModelConfig.count(),
  ]);

  if (modelConfig === null) {
    if (modelConfigCount > 0) {
      return undefined;
    }

    return {
      configuration,
      dailyLimit: null,
      maxTokens: Math.max(minimumTokenBudget, requestedTokens),
      modelConfigId: null,
      monthlyLimit: null,
    };
  }

  if (modelConfig.provider !== configuration.provider) {
    return undefined;
  }

  return {
    configuration: { ...configuration, model: modelConfig.model },
    dailyLimit: modelConfig.dailyLimit,
    maxTokens: Math.max(minimumTokenBudget, Math.min(requestedTokens, modelConfig.maxTokens)),
    modelConfigId: modelConfig.id,
    monthlyLimit: modelConfig.monthlyLimit,
  };
}

async function recordUsage(
  database: PrismaClient,
  request: AiGenerationRequest,
  selection: AiModelSelection | undefined,
  status: AiUsageStatus,
  inputTokens: number,
  outputTokens: number,
): Promise<void> {
  const configuration = selection?.configuration;

  await database.aiUsageLog.create({
    data: {
      agent: aiAgentTypeToPrisma[request.agent],
      inputTokens,
      model: configuration?.model ?? 'unconfigured',
      modelConfigId: selection?.modelConfigId ?? null,
      outputTokens,
      provider: configuration?.provider ?? 'unconfigured',
      status,
    },
  });
}

export async function runAiGeneration(
  database: PrismaClient,
  request: AiGenerationRequest,
): Promise<AiGenerationResult> {
  const inputTokens = estimateTokens(`${request.systemPrompt}\n${request.taskPrompt}`);
  const selection = await selectAiModel(database, request.maxTokens);

  if (selection === undefined) {
    await recordUsage(database, request, undefined, AiUsageStatus.SKIPPED, inputTokens, 0);

    return { kind: 'unavailable' };
  }

  const [todayUsage, monthUsage] = await Promise.all([
    database.aiUsageLog.aggregate({
      _sum: { inputTokens: true, outputTokens: true },
      where: { createdAt: { gte: getUtcDayStart() }, modelConfigId: selection.modelConfigId },
    }),
    database.aiUsageLog.aggregate({
      _sum: { inputTokens: true, outputTokens: true },
      where: { createdAt: { gte: getUtcMonthStart() }, modelConfigId: selection.modelConfigId },
    }),
  ]);
  const usedToday = (todayUsage._sum.inputTokens ?? 0) + (todayUsage._sum.outputTokens ?? 0);
  const usedThisMonth = (monthUsage._sum.inputTokens ?? 0) + (monthUsage._sum.outputTokens ?? 0);
  const decision = getAiUsageDecision(
    {
      dailyLimit: selection.dailyLimit,
      monthlyLimit: selection.monthlyLimit,
      usedThisMonth,
      usedToday,
    },
    inputTokens + selection.maxTokens,
  );

  if (decision.kind !== 'allowed') {
    await recordUsage(database, request, selection, AiUsageStatus.SKIPPED, inputTokens, 0);

    return { kind: 'budget-exceeded' };
  }

  try {
    const stream = await streamAssistantModel(selection.configuration, {
      maxTokens: selection.maxTokens,
      messages: [{ content: request.taskPrompt, role: 'user' }],
      systemPrompt: request.systemPrompt,
    });
    const text = await readTextStream(stream);
    const outputTokens = estimateTokens(text);

    await recordUsage(
      database,
      request,
      selection,
      AiUsageStatus.COMPLETED,
      inputTokens,
      outputTokens,
    );

    return { kind: 'generated', text };
  } catch (error) {
    if (
      error instanceof AssistantModelError ||
      error instanceof DOMException ||
      error instanceof TypeError
    ) {
      logger.warn('ai.automation.model_failed', {
        agent: request.agent,
        errorName: error.name,
        model: selection.configuration.model,
        provider: selection.configuration.provider,
      });
      await recordUsage(database, request, selection, AiUsageStatus.FAILED, inputTokens, 0);

      return { kind: 'failed' };
    }

    throw error;
  }
}
