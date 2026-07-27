import { describe, expect, it } from 'vitest';

import { planAiTask } from '../src/ai/orchestrator/ai-orchestrator';

describe('AIOS 调度中心', () => {
  it('将收入分析任务派发给规划、数据与报告 Agent', () => {
    expect(
      planAiTask({
        hasProjectWritePermission: false,
        request: '分析本月收入趋势，并输出一份管理层摘要。',
      }),
    ).toEqual({
      agentRoles: ['planner', 'data', 'writer'],
      intent: 'analysis',
      requiresApproval: false,
    });
  });

  it('将创建项目任务的请求变成需要人工审批的行动计划', () => {
    expect(
      planAiTask({
        hasProjectWritePermission: true,
        request: '为本周客户需求创建一个项目跟进任务。',
      }),
    ).toEqual({
      agentRoles: ['planner', 'action'],
      intent: 'action',
      requiresApproval: true,
      toolKey: 'project.task.create',
      toolExecution: 'approval-required',
    });
  });

  it('禁止没有项目写入权限的任务创建请求', () => {
    expect(
      planAiTask({
        hasProjectWritePermission: false,
        request: '为本周客户需求创建一个项目跟进任务。',
      }),
    ).toEqual({
      agentRoles: ['planner', 'action'],
      intent: 'action',
      requiresApproval: false,
      toolKey: 'project.task.create',
      toolExecution: 'forbidden',
    });
  });
});
