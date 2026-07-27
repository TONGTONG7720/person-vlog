import { z } from 'zod';

import { parseAgentJson } from '@/ai/agents/agent-json';

const meetingAgentResultSchema = z
  .object({
    confirmed: z.array(z.string().trim().min(2).max(240)).max(10),
    nextActions: z.array(z.string().trim().min(2).max(240)).min(1).max(10),
    openQuestions: z.array(z.string().trim().min(2).max(240)).max(10),
    summary: z.string().trim().min(10).max(2_000),
    target: z.string().trim().min(2).max(500),
  })
  .strict();

export type MeetingAgentResult = z.output<typeof meetingAgentResultSchema> &
  Readonly<{ readonly status: 'draft' }>;

export function parseMeetingAgentResult(value: string): MeetingAgentResult | undefined {
  const parsed = parseAgentJson(meetingAgentResultSchema, value);

  return parsed === undefined ? undefined : { ...parsed, status: 'draft' };
}
