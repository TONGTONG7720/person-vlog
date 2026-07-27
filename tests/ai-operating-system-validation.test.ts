import { describe, expect, it } from 'vitest';

import {
  aiOperatingSystemApprovalDecisionSchema,
  aiOperatingSystemApprovalIdSchema,
  aiOperatingSystemTaskRequestSchema,
  aiWorkflowDefinitionSchema,
} from '../src/server/saas/ai-operating-system-validation';

describe('AIOS 输入边界', () => {
  it('要求 AI 任务属于一个明确的企业 AI Workspace', () => {
    const parsed = aiOperatingSystemTaskRequestSchema.safeParse({
      request: '分析本月的收入趋势并给出需要关注的风险。',
    });

    expect(parsed.success).toBe(false);
  });

  it('拒绝没有触发节点的工作流', () => {
    const parsed = aiWorkflowDefinitionSchema.safeParse({
      name: '客户线索自动化',
      nodes: [{ id: 'agent-1', kind: 'agent', label: '分析线索' }],
    });

    expect(parsed.success).toBe(false);
  });

  it('接受从触发节点开始的工作流', () => {
    const parsed = aiWorkflowDefinitionSchema.safeParse({
      name: '客户线索自动化',
      nodes: [
        { id: 'trigger-1', kind: 'trigger', label: '收到新线索' },
        { id: 'agent-1', kind: 'agent', label: '分析线索' },
      ],
    });

    expect(parsed.success).toBe(true);
  });

  it('只接受明确的人工审批决议', () => {
    expect(aiOperatingSystemApprovalDecisionSchema.safeParse({ decision: 'approve' }).success).toBe(
      true,
    );
    expect(aiOperatingSystemApprovalDecisionSchema.safeParse({ decision: 'skip' }).success).toBe(
      false,
    );
  });

  it('拒绝空的审批标识', () => {
    expect(aiOperatingSystemApprovalIdSchema.safeParse('').success).toBe(false);
  });
});
