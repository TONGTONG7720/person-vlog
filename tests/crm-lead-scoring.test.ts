import { describe, expect, it } from 'vitest';

import { calculateLeadScore, inferLeadPriority } from '../src/server/crm/lead-scoring';

describe('CRM 线索评分', () => {
  it('将明确预算、时间和服务需求的线索标记为高优先级', () => {
    const score = calculateLeadScore({
      budget: 'over-twenty-k',
      company: '远见数字工作室',
      service: 'ai',
      source: 'xiaohongshu',
      timeline: 'soon',
    });

    expect(score).toBeGreaterThanOrEqual(70);
    expect(inferLeadPriority(score)).toBe('high');
  });
});
