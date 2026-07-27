import {
  type AiToolExecutionDecision,
  type AiToolRiskLevel,
} from '@/ai/operating-system/contracts';

type BuiltInAiTool = Readonly<{
  readonly description: string;
  readonly key: string;
  readonly requiredPermission: 'agent.read' | 'project.write';
  readonly riskLevel: AiToolRiskLevel;
}>;

export const builtInAiTools = [
  {
    description: '在已授权的当前工作区知识库中检索资料。',
    key: 'knowledge.search',
    requiredPermission: 'agent.read',
    riskLevel: 'read',
  },
  {
    description: '将任务分析保存为当前工作区内的 AI 报告。',
    key: 'report.create',
    requiredPermission: 'agent.read',
    riskLevel: 'write',
  },
  {
    description: '在当前工作区项目下创建一条项目任务。',
    key: 'project.task.create',
    requiredPermission: 'project.write',
    riskLevel: 'high',
  },
] as const satisfies readonly BuiltInAiTool[];

export type BuiltInAiToolKey = (typeof builtInAiTools)[number]['key'];

type ToolExecutionDecisionInput = Readonly<{
  readonly hasRequiredPermission: boolean;
  readonly toolKey: BuiltInAiToolKey;
}>;

export function decideToolExecution(input: ToolExecutionDecisionInput): AiToolExecutionDecision {
  if (!input.hasRequiredPermission) {
    return { kind: 'forbidden', toolKey: input.toolKey };
  }

  const tool = builtInAiTools.find((item) => item.key === input.toolKey);

  if (tool === undefined) {
    return { kind: 'forbidden', toolKey: input.toolKey };
  }

  return tool.riskLevel === 'read'
    ? { kind: 'execute', toolKey: tool.key }
    : { kind: 'approval-required', toolKey: tool.key };
}
