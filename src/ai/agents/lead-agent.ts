import { z } from 'zod';

import { parseAgentJson } from '@/ai/agents/agent-json';

const leadCategories = [
  'AI Application',
  'Enterprise System',
  'Automation',
  'Website',
  'General Consultation',
] as const;
const leadDifficulties = ['low', 'medium', 'high'] as const;
const commercialCommitmentPattern =
  /(?:¥|\$|报价|价格|预算为|(?:\d+|[一二三四五六七八九十]+)(?:天|周|个月)内(?:完成|交付|上线))/u;

const leadAgentResultSchema = z
  .object({
    category: z.enum(leadCategories),
    difficulty: z.enum(leadDifficulties),
    questions: z.array(z.string().trim().min(2).max(160)).min(1).max(5),
    suggestedService: z.string().trim().min(2).max(120),
    summary: z.string().trim().min(10).max(1_500),
  })
  .strict();

export type LeadAgentResult = z.output<typeof leadAgentResultSchema>;

export function parseLeadAgentResult(value: string): LeadAgentResult | undefined {
  const parsed = parseAgentJson(leadAgentResultSchema, value);

  return parsed === undefined || commercialCommitmentPattern.test(parsed.summary)
    ? undefined
    : parsed;
}
