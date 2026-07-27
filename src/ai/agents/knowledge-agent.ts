import { z } from 'zod';

import { parseAgentJson } from '@/ai/agents/agent-json';

const knowledgeAgentResultSchema = z
  .object({
    category: z.string().trim().min(2).max(80),
    content: z.string().trim().min(20).max(8_000),
    title: z.string().trim().min(2).max(160),
  })
  .strict();

export type KnowledgeAgentResult = z.output<typeof knowledgeAgentResultSchema> &
  Readonly<{ readonly status: 'pending-review' }>;

export function parseKnowledgeAgentResult(value: string): KnowledgeAgentResult | undefined {
  const parsed = parseAgentJson(knowledgeAgentResultSchema, value);

  return parsed === undefined ? undefined : { ...parsed, status: 'pending-review' };
}
