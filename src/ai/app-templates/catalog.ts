import type {
  AiAppBlock,
  AiAppConfiguration,
  AiAppType,
  AiAppWorkflowDefinition,
} from '@/ai/blocks/contracts';

export type AiAppTemplateDefinition = Readonly<{
  readonly blocks: readonly AiAppBlock[];
  readonly category: string;
  readonly config: AiAppConfiguration;
  readonly description: string;
  readonly key: string;
  readonly name: string;
  readonly type: AiAppType;
  readonly workflow: AiAppWorkflowDefinition;
}>;

const baseKnowledgeWorkflow = {
  edges: [
    { id: 'edge-input-agent', source: 'input', target: 'agent' },
    { id: 'edge-agent-knowledge', source: 'agent', target: 'knowledge' },
    { id: 'edge-knowledge-output', source: 'knowledge', target: 'output' },
  ],
  nodes: [
    { id: 'input', label: '员工输入', position: { x: 0, y: 112 }, type: 'input' },
    { id: 'agent', label: 'AI Agent', position: { x: 208, y: 112 }, type: 'agent' },
    { id: 'knowledge', label: '企业知识', position: { x: 416, y: 112 }, type: 'knowledge' },
    { id: 'output', label: '受控回答', position: { x: 624, y: 112 }, type: 'output' },
  ],
} as const satisfies AiAppWorkflowDefinition;

export const aiAppTemplateDefinitions = [
  {
    blocks: [
      {
        config: { welcomeMessage: '请输入与你当前工作相关的问题。' },
        id: 'chat',
        position: { x: 64, y: 72 },
        type: 'chat',
      },
      {
        config: { source: 'workspace-knowledge' },
        id: 'knowledge',
        position: { x: 320, y: 72 },
        type: 'knowledge',
      },
      {
        config: { workflowName: '检索并引用回答' },
        id: 'workflow',
        position: { x: 576, y: 72 },
        type: 'workflow',
      },
    ],
    category: '企业办公',
    config: {
      model: 'enterprise-default',
      systemPrompt: '只依据当前企业已授权知识回答；无法确认时明确说明资料不足，并给出下一步建议。',
      welcomeMessage: '你好，我可以根据当前已授权的企业资料协助你查找信息。',
    },
    description: '将当前 AI Workspace 的已授权资料转换为带来源边界的内部问答应用。',
    key: 'enterprise-knowledge-assistant',
    name: '企业知识助手',
    type: 'KNOWLEDGE',
    workflow: baseKnowledgeWorkflow,
  },
  {
    blocks: [
      {
        config: { welcomeMessage: '请描述遇到的问题，我会先检索已批准的服务资料。' },
        id: 'chat',
        position: { x: 64, y: 72 },
        type: 'chat',
      },
      {
        config: { source: 'workspace-knowledge' },
        id: 'knowledge',
        position: { x: 320, y: 72 },
        type: 'knowledge',
      },
      {
        config: { toolKey: 'ticket.create', requiresApproval: true },
        id: 'tool',
        position: { x: 576, y: 72 },
        type: 'tool',
      },
    ],
    category: '客服',
    config: {
      model: 'enterprise-default',
      systemPrompt: '先根据已授权 FAQ 和服务资料回答。若需要创建工单，只提出建议，不执行外部写入。',
      toolKeys: ['knowledge.search'],
      welcomeMessage: '你好，我会先根据已批准的服务资料帮助你定位问题。',
    },
    description: '用于客服问答与工单建议；外部工单写入必须经过人工审批和工具适配器。',
    key: 'customer-support-assistant',
    name: 'AI 客服',
    type: 'CUSTOMER',
    workflow: baseKnowledgeWorkflow,
  },
  {
    blocks: [
      {
        config: { fields: ['公司', '目标', '联系人'] },
        id: 'form',
        position: { x: 64, y: 72 },
        type: 'form',
      },
      {
        config: { source: 'workspace-knowledge' },
        id: 'knowledge',
        position: { x: 320, y: 72 },
        type: 'knowledge',
      },
      {
        config: { workflowName: '线索准备建议' },
        id: 'workflow',
        position: { x: 576, y: 72 },
        type: 'workflow',
      },
    ],
    category: '销售',
    config: {
      model: 'enterprise-default',
      systemPrompt:
        '根据已授权客户与产品资料整理线索准备建议，不编造客户信息，不自动发送邮件或写入 CRM。',
      welcomeMessage: '告诉我线索的背景，我会整理需要人工确认的下一步。',
    },
    description: '帮助销售团队准备线索、资料与下一步建议，保留人工确认点。',
    key: 'sales-preparation-assistant',
    name: 'AI 销售助手',
    type: 'SALES',
    workflow: baseKnowledgeWorkflow,
  },
  {
    blocks: [
      {
        config: { fields: ['问题', '数据范围'] },
        id: 'form',
        position: { x: 64, y: 72 },
        type: 'form',
      },
      {
        config: { source: 'workspace-knowledge' },
        id: 'knowledge',
        position: { x: 320, y: 72 },
        type: 'knowledge',
      },
      {
        config: { workflowName: '数据分析报告' },
        id: 'workflow',
        position: { x: 576, y: 72 },
        type: 'workflow',
      },
    ],
    category: '数据分析',
    config: {
      model: 'enterprise-default',
      systemPrompt: '仅基于当前已授权数据和文档输出趋势、风险与待验证项；不伪造指标或数据来源。',
      welcomeMessage: '告诉我需要分析的业务问题和可用数据范围。',
    },
    description: '把已授权资料组织为可复核的数据分析问答与报告工作流。',
    key: 'data-analysis-assistant',
    name: 'AI 数据分析助手',
    type: 'DATA',
    workflow: baseKnowledgeWorkflow,
  },
] as const satisfies readonly AiAppTemplateDefinition[];

export function findAiAppTemplateDefinition(key: string): AiAppTemplateDefinition | undefined {
  return aiAppTemplateDefinitions.find((template) => template.key === key);
}
