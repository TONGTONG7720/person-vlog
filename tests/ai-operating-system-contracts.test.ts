import { describe, expect, it } from 'vitest';

import { selectAgentTeam } from '../src/ai/agents/team/default-team';
import { aiWorkflowNodeKinds } from '../src/ai/operating-system/contracts';
import { decideToolExecution } from '../src/ai/tools/tool-registry';

describe('AI 企业操作系统核心契约', () => {
  it('为营收分析安排规划、数据与报告 Agent', () => {
    expect(selectAgentTeam({ request: '帮我分析本月销售与收入趋势' })).toEqual([
      'planner',
      'data',
      'writer',
    ]);
  });

  it('要求人工审批后才允许执行写入型任务工具', () => {
    expect(
      decideToolExecution({
        hasRequiredPermission: true,
        toolKey: 'project.task.create',
      }),
    ).toEqual({ kind: 'approval-required', toolKey: 'project.task.create' });
  });

  it('拒绝没有所需权限的知识查询工具调用', () => {
    expect(
      decideToolExecution({
        hasRequiredPermission: false,
        toolKey: 'knowledge.search',
      }),
    ).toEqual({ kind: 'forbidden', toolKey: 'knowledge.search' });
  });

  it('固定工作流的可视化节点类型', () => {
    expect(aiWorkflowNodeKinds).toEqual(['trigger', 'agent', 'tool', 'condition', 'action']);
  });
});
