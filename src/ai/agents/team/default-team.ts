import type { AiAgentRole } from '@/ai/operating-system/contracts';

type AgentTeamSelectionInput = Readonly<{
  readonly request: string;
}>;

const revenueAnalysisKeywords = ['分析', '营收', '收入', '销售', '趋势', '数据'] as const;
const researchKeywords = ['查询', '研究', '资料', '知识库', '调研'] as const;
const actionKeywords = [
  '创建任务',
  '项目跟进任务',
  '创建线索',
  '发送邮件',
  '安排跟进',
  '执行',
] as const;

export function selectAgentTeam(input: AgentTeamSelectionInput): readonly AiAgentRole[] {
  const request = input.request.toLocaleLowerCase('zh-CN');

  if (includesAny(request, revenueAnalysisKeywords)) {
    return ['planner', 'data', 'writer'];
  }

  if (includesAny(request, researchKeywords)) {
    return ['planner', 'research', 'writer'];
  }

  if (includesAny(request, actionKeywords)) {
    return ['planner', 'action'];
  }

  return ['planner', 'writer'];
}

function includesAny(value: string, keywords: readonly string[]): boolean {
  return keywords.some((keyword) => value.includes(keyword));
}
