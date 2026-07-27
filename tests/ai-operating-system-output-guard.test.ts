import { describe, expect, it } from 'vitest';

import { isSafeAiOperatingSystemOutput } from '../src/ai/operating-system/output-guard';

describe('AIOS 输出边界', () => {
  it('允许正常的企业分析摘要', () => {
    expect(isSafeAiOperatingSystemOutput('本月收入趋势稳定，建议关注续费风险。')).toBe(true);
  });

  it('拒绝疑似凭证内容和超长输出', () => {
    expect(isSafeAiOperatingSystemOutput('API_KEY=example-value')).toBe(false);
    expect(isSafeAiOperatingSystemOutput('a'.repeat(24_001))).toBe(false);
  });
});
