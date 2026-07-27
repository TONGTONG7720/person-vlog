import type { AiAgentRole } from '@/ai/operating-system/contracts';

type CreateTaskMemoryContentInput = Readonly<{
  readonly agentRole: AiAgentRole;
  readonly requestSummary: string;
}>;

export function createTaskMemoryContent(input: CreateTaskMemoryContentInput): string {
  return `${getAgentRoleLabel(input.agentRole)} 已参与任务：${input.requestSummary}`;
}

function getAgentRoleLabel(role: AiAgentRole): string {
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
