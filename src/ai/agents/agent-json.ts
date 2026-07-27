import { z } from 'zod';

function stripJsonFence(value: string): string {
  return value
    .trim()
    .replace(/^```(?:json)?\s*/iu, '')
    .replace(/\s*```$/u, '')
    .trim();
}

export function parseAgentJson<Result>(
  schema: z.ZodType<Result>,
  value: string,
): Result | undefined {
  try {
    const parsed: unknown = JSON.parse(stripJsonFence(value));
    const result = schema.safeParse(parsed);

    return result.success ? result.data : undefined;
  } catch (error) {
    if (error instanceof SyntaxError) {
      return undefined;
    }

    throw error;
  }
}
