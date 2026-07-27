export const aiAppTypes = ['KNOWLEDGE', 'CUSTOMER', 'SALES', 'DATA', 'WORKFLOW'] as const;

export const aiAppLifecycleStatuses = ['DRAFT', 'TESTING', 'PUBLISHED', 'ARCHIVED'] as const;

export const aiAppLifecycleActions = [
  'save-draft',
  'start-testing',
  'publish',
  'archive',
  'restore-draft',
] as const;

export const aiAppEnvironments = ['DEVELOPMENT', 'PRODUCTION'] as const;

export const aiAppBlockTypes = ['chat', 'knowledge', 'form', 'tool', 'workflow'] as const;

export const aiWorkflowCanvasNodeTypes = ['input', 'agent', 'knowledge', 'tool', 'output'] as const;

export const aiAppAccessRuleKinds = ['ALL_MEMBERS', 'ROLE', 'DEPARTMENT', 'MEMBERSHIP'] as const;

export type AiAppType = (typeof aiAppTypes)[number];
export type AiAppLifecycleStatus = (typeof aiAppLifecycleStatuses)[number];
export type AiAppLifecycleAction = (typeof aiAppLifecycleActions)[number];
export type AiAppEnvironment = (typeof aiAppEnvironments)[number];
export type AiAppBlockType = (typeof aiAppBlockTypes)[number];
export type AiWorkflowCanvasNodeType = (typeof aiWorkflowCanvasNodeTypes)[number];
export type AiAppAccessRuleKind = (typeof aiAppAccessRuleKinds)[number];

export type AiCanvasPosition = Readonly<{
  readonly x: number;
  readonly y: number;
}>;

export type AiAppBlock = Readonly<{
  readonly config: Readonly<Record<string, unknown>>;
  readonly id: string;
  readonly position: AiCanvasPosition;
  readonly type: AiAppBlockType;
}>;

export type AiAppWorkflowNode = Readonly<{
  readonly id: string;
  readonly label: string;
  readonly position: AiCanvasPosition;
  readonly type: AiWorkflowCanvasNodeType;
}>;

export type AiAppWorkflowEdge = Readonly<{
  readonly id: string;
  readonly source: string;
  readonly target: string;
}>;

export type AiAppWorkflowDefinition = Readonly<{
  readonly edges: readonly AiAppWorkflowEdge[];
  readonly nodes: readonly AiAppWorkflowNode[];
}>;

export type AiAppConfiguration = Readonly<{
  readonly model: string;
  readonly similarityThreshold?: number;
  readonly systemPrompt: string;
  readonly temperature?: number;
  readonly toolKeys?: readonly string[];
  readonly topK?: number;
  readonly welcomeMessage?: string;
}>;

export type AiAppAccessRule =
  | Readonly<{ readonly kind: 'ALL_MEMBERS' }>
  | Readonly<{ readonly kind: 'ROLE'; readonly subject: string }>
  | Readonly<{ readonly kind: 'DEPARTMENT' | 'MEMBERSHIP'; readonly subject: string }>;
