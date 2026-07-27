import { z } from 'zod';

import { parseAgentJson } from '@/ai/agents/agent-json';

const projectAgentResultSchema = z
  .object({
    summary: z.string().trim().min(10).max(2_000),
    tasks: z.array(z.string().trim().min(2).max(160)).min(1).max(10),
  })
  .strict();

export type ProjectAgentResult = z.output<typeof projectAgentResultSchema> &
  Readonly<{ readonly status: 'draft' }>;

export function parseProjectAgentResult(value: string): ProjectAgentResult | undefined {
  const parsed = parseAgentJson(projectAgentResultSchema, value);

  return parsed === undefined ? undefined : { ...parsed, status: 'draft' };
}
