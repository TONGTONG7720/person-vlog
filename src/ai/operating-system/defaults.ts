import type { AiAgentRole } from '@/ai/operating-system/contracts';
import type { BuiltInAiToolKey } from '@/ai/tools/tool-registry';
import type { AiWorkflowNodeDefinition } from '@/server/saas/ai-operating-system-validation';

type AiOperatingSystemAgentDefinition = Readonly<{
  readonly name: string;
  readonly role: AiAgentRole;
  readonly systemPrompt: string;
  readonly toolKeys: readonly BuiltInAiToolKey[];
}>;

type AiOperatingSystemEmployeeDefinition = Readonly<{
  readonly department: string;
  readonly description: string;
  readonly name: string;
  readonly role: AiAgentRole;
}>;

export const aiOperatingSystemAgentDefinitions = [
  {
    name: '规划调度 Agent',
    role: 'planner',
    systemPrompt: '将企业请求拆分为最小可审计步骤，明确需要的数据、Agent 与人工审批点。',
    toolKeys: ['knowledge.search'],
  },
  {
    name: '研究 Agent',
    role: 'research',
    systemPrompt: '仅检索当前企业、当前工作区和当前角色已授权的资料，并保留来源边界。',
    toolKeys: ['knowledge.search'],
  },
  {
    name: '数据 Agent',
    role: 'data',
    systemPrompt: '提炼已授权数据的趋势、异常与风险；没有数据时明确说明资料不足。',
    toolKeys: ['knowledge.search'],
  },
  {
    name: '报告 Agent',
    role: 'writer',
    systemPrompt: '将调度结果整理为清晰、可复核的 Markdown 报告，不伪造事实或引用。',
    toolKeys: ['knowledge.search', 'report.create'],
  },
  {
    name: '行动 Agent',
    role: 'action',
    systemPrompt: '只提出或执行获得授权的业务动作；高风险写入必须等待人工审批。',
    toolKeys: ['project.task.create'],
  },
] as const satisfies readonly AiOperatingSystemAgentDefinition[];

export const aiOperatingSystemEmployeeDefinitions = [
  {
    department: '客户成功',
    description: '面向客户问题整理已授权知识并输出下一步建议。',
    name: 'AI 客服',
    role: 'research',
  },
  {
    department: '销售',
    description: '协助梳理线索、跟进节奏与需要人工确认的动作。',
    name: 'AI 销售助手',
    role: 'action',
  },
  {
    department: '经营分析',
    description: '将已授权数据转为趋势、风险和管理摘要。',
    name: 'AI 数据分析师',
    role: 'data',
  },
  {
    department: '技术',
    description: '基于当前工作区知识组织技术方案和执行建议。',
    name: 'AI 技术顾问',
    role: 'planner',
  },
] as const satisfies readonly AiOperatingSystemEmployeeDefinition[];

export const defaultAiOperatingSystemWorkflowNodes = [
  { id: 'trigger-request', kind: 'trigger', label: '收到企业请求' },
  { id: 'agent-planner', kind: 'agent', label: 'Planner Agent 分解任务' },
  { id: 'tool-knowledge', kind: 'tool', label: '读取已授权知识' },
  { id: 'condition-approval', kind: 'condition', label: '检查是否需要人工审批' },
  { id: 'action-report', kind: 'action', label: '生成报告或等待审批' },
] as const satisfies readonly AiWorkflowNodeDefinition[];

export function createKnowledgeGraphSeed(
  input: Readonly<{
    readonly organizationName: string;
    readonly workspaceName: string;
  }>,
): readonly Readonly<{
  readonly metadata: Readonly<{ readonly source: string }>;
  readonly name: string;
  readonly type: string;
}>[] {
  return [
    { metadata: { source: 'aios-bootstrap' }, name: input.organizationName, type: 'organization' },
    { metadata: { source: 'aios-bootstrap' }, name: input.workspaceName, type: 'workspace' },
  ];
}
