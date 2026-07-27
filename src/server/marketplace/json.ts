import type { Prisma } from '@/generated/prisma/client';

import { MarketplaceInputError } from '@/server/marketplace/errors';

export function toMarketplaceJson(value: unknown): Prisma.InputJsonValue {
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => toMarketplaceJson(item));
  }

  if (isPlainRecord(value)) {
    const result: Record<string, Prisma.InputJsonValue> = {};

    for (const [key, item] of Object.entries(value)) {
      result[key] = toMarketplaceJson(item);
    }

    return result;
  }

  throw new MarketplaceInputError('市场内容只能包含可序列化的文本、数字、布尔值、数组和对象。');
}

export function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
