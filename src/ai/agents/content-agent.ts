import { z } from 'zod';

import { parseAgentJson } from '@/ai/agents/agent-json';

const contentAgentResultSchema = z
  .object({
    outline: z.array(z.string().trim().min(2).max(160)).min(3).max(8),
    seoDescription: z.string().trim().min(10).max(160),
    title: z.string().trim().min(2).max(160),
    videoScript: z.string().trim().min(10).max(2_000),
    xiaohongshuDirection: z.string().trim().min(10).max(1_000),
  })
  .strict();

export type ContentAgentResult = z.output<typeof contentAgentResultSchema> &
  Readonly<{ readonly status: 'draft' }>;

export function parseContentAgentResult(value: string): ContentAgentResult | undefined {
  const parsed = parseAgentJson(contentAgentResultSchema, value);

  return parsed === undefined ? undefined : { ...parsed, status: 'draft' };
}
