import type { Prisma } from '@/generated/prisma/client';
import { AiPlatformInputError } from '@/server/saas/ai-platform-errors';

type AiNativeAppJsonValue = Prisma.InputJsonValue | null;

export function toAiNativeAppJsonInput(value: unknown): Prisma.InputJsonValue {
  const converted = toAiNativeAppJsonValue(value);

  if (converted === null) {
    throw new AiPlatformInputError('AI 应用配置必须是 JSON 对象或数组。');
  }

  return converted;
}

function toAiNativeAppJsonValue(value: unknown): AiNativeAppJsonValue {
  if (value === null) {
    return null;
  }

  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => toAiNativeAppJsonValue(item));
  }

  if (typeof value === 'object') {
    const result: Record<string, AiNativeAppJsonValue | undefined> = {};

    for (const [key, item] of Object.entries(value)) {
      result[key] = toAiNativeAppJsonValue(item);
    }

    return result;
  }

  throw new AiPlatformInputError('AI 应用配置只能包含 JSON 支持的数据类型。');
}
