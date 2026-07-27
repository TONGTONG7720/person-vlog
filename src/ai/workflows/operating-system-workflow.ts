import type { AiTaskPlan } from '@/ai/orchestrator/ai-orchestrator';

type CreateAiTaskReportInput = Readonly<{
  readonly knowledgeSourceCount: number;
  readonly plan: AiTaskPlan;
  readonly requestSummary: string;
}>;

export function createAiTaskReport(input: CreateAiTaskReportInput): string {
  const agentList = input.plan.agentRoles.map(getAgentRoleLabel).join(' → ');
  const sourceSummary =
    input.knowledgeSourceCount === 0
      ? '当前工作区未检索到可引用资料，以下内容仅为执行计划，不构成业务结论。'
      : `已在当前授权范围内检索到 ${input.knowledgeSourceCount} 条资料来源。`;

  return [
    '# AIOS 任务摘要',
    '',
    `**请求**：${input.requestSummary}`,
    '',
    `**协作路径**：${agentList}`,
    '',
    `**知识边界**：${sourceSummary}`,
    '',
    '## 建议下一步',
    '',
    input.plan.requiresApproval
      ? '该任务包含高风险业务动作，已转入人工审批，审批通过前不会执行写入操作。'
      : '该任务已生成可复核的工作摘要；如需业务写入，请通过受控工具和审批流程继续。',
  ].join('\n');
}

function getAgentRoleLabel(role: AiTaskPlan['agentRoles'][number]): string {
  switch (role) {
    case 'action':
      return '行动 Agent';
    case 'data':
      return '数据 Agent';
    case 'planner':
      return '规划 Agent';
    case 'research':
      return '研究 Agent';
    case 'writer':
      return '报告 Agent';
  }
}
