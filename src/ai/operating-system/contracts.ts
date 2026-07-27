export const aiAgentRoles = ['planner', 'research', 'data', 'writer', 'action'] as const;

export type AiAgentRole = (typeof aiAgentRoles)[number];

export const aiWorkflowNodeKinds = ['trigger', 'agent', 'tool', 'condition', 'action'] as const;

export type AiWorkflowNodeKind = (typeof aiWorkflowNodeKinds)[number];

export const aiToolRiskLevels = ['read', 'write', 'high'] as const;

export type AiToolRiskLevel = (typeof aiToolRiskLevels)[number];

export type AiToolExecutionDecision =
  | Readonly<{ readonly kind: 'execute'; readonly toolKey: string }>
  | Readonly<{ readonly kind: 'approval-required'; readonly toolKey: string }>
  | Readonly<{ readonly kind: 'forbidden'; readonly toolKey: string }>;
