import type { CrmLeadPriority, CrmLeadSource, CrmLeadTag } from '@/types/crm';

export type LeadScoreInput = Readonly<{
  readonly budget?: string;
  readonly company?: string;
  readonly service?: string;
  readonly source?: CrmLeadSource;
  readonly timeline?: string;
}>;

export function calculateLeadScore(input: LeadScoreInput): number {
  let score = 20;

  if (input.company?.trim().length) {
    score += 15;
  }

  switch (input.budget) {
    case 'over-twenty-k':
      score += 30;
      break;
    case 'five-to-twenty-k':
      score += 20;
      break;
    case 'scope-based':
      score += 15;
      break;
    case 'under-5k':
      score += 5;
      break;
    default:
      break;
  }

  switch (input.timeline) {
    case 'soon':
      score += 20;
      break;
    case 'one-to-three-months':
      score += 12;
      break;
    case 'exploring':
      score += 5;
      break;
    default:
      break;
  }

  if (input.service === 'ai' || input.service === 'enterprise-system') {
    score += 10;
  }

  if (
    input.source === 'xiaohongshu' ||
    input.source === 'douyin' ||
    input.source === 'github' ||
    input.source === 'google'
  ) {
    score += 10;
  }

  return Math.max(0, Math.min(100, score));
}

export function inferLeadPriority(score: number): CrmLeadPriority {
  if (score >= 70) {
    return 'high';
  }

  return score < 40 ? 'low' : 'medium';
}

export function createLeadTags(input: LeadScoreInput): readonly CrmLeadTag[] {
  const tags: CrmLeadTag[] = [];

  if (input.service === 'ai') {
    tags.push('AI');
  }

  if (input.service === 'automation') {
    tags.push('Automation');
  }

  if (input.service === 'enterprise-system') {
    tags.push('Enterprise', 'System');
  }

  return tags;
}
