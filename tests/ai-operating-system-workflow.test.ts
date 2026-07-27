import { describe, expect, it } from 'vitest';

import { createTaskKnowledgeEntityName } from '../src/ai/knowledge-graph/knowledge-graph';
import { createTaskMemoryContent } from '../src/ai/memory/agent-memory';
import { decideAiTaskDispatch } from '../src/ai/queue/task-dispatcher';
import { createAiTaskReport } from '../src/ai/workflows/operating-system-workflow';

describe('AIOS 工作流输出', () => {
  it('将高风险动作转入人工审批队列', () => {
    expect(
      decideAiTaskDispatch({
        agentRoles: ['planner', 'action'],
        intent: 'action',
        requiresApproval: true,
        toolKey: 'project.task.create',
        toolExecution: 'approval-required',
      }),
    ).toEqual({ kind: 'awaiting-approval' });
  });

  it('在没有检索资料时明确标注报告边界', () => {
    const report = createAiTaskReport({
      knowledgeSourceCount: 0,
      plan: {
        agentRoles: ['planner', 'data', 'writer'],
        intent: 'analysis',
        requiresApproval: false,
      },
      requestSummary: '分析本月收入趋势',
    });

    expect(report).toContain('当前工作区未检索到可引用资料');
  });

  it('将任务记忆限制在简洁摘要长度', () => {
    expect(
      createTaskMemoryContent({ agentRole: 'planner', requestSummary: '分析本月收入趋势' }),
    ).toContain('规划 Agent');
    expect(createTaskKnowledgeEntityName('x'.repeat(120))).toHaveLength(96);
  });

  it('将任务标题中的连续空白规范为单个空格', () => {
    expect(createTaskKnowledgeEntityName('分析本月\n\n  收入趋势')).toBe('分析本月 收入趋势');
  });
});
