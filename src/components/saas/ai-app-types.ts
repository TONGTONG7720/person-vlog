import type {
  AiAppAccessRule,
  AiAppBlock,
  AiAppLifecycleStatus,
  AiAppType,
  AiAppWorkflowDefinition,
} from '@/ai/blocks/contracts';

export type AiAppBuilderConfiguration = Readonly<{
  readonly model: string;
  readonly similarityThreshold: number;
  readonly systemPrompt: string;
  readonly temperature: number;
  readonly toolKeys: readonly string[];
  readonly topK: number;
  readonly welcomeMessage: string;
}>;

export type AiAppBuilderWorkspace = Readonly<{
  readonly id: string;
  readonly name: string;
  readonly slug: string;
}>;

export type AiAppBuilderTool = Readonly<{
  readonly description: string;
  readonly key: string;
  readonly name: string;
  readonly riskLevel: 'HIGH' | 'READ' | 'WRITE';
}>;

export type AiAppBuilderTemplate = Readonly<{
  readonly blocks: readonly AiAppBlock[];
  readonly category: string;
  readonly config: AiAppBuilderConfiguration;
  readonly description: string;
  readonly key: string;
  readonly name: string;
  readonly type: AiAppType;
  readonly workflow: AiAppWorkflowDefinition;
}>;

export type AiAppBuilderDraft = Readonly<{
  readonly accessRules: readonly AiAppAccessRule[];
  readonly blocks: readonly AiAppBlock[];
  readonly config: AiAppBuilderConfiguration;
  readonly description: string;
  readonly name: string;
  readonly slug: string;
  readonly templateKey?: string;
  readonly type: AiAppType;
  readonly workflow: AiAppWorkflowDefinition;
  readonly workspaceId: string;
}>;

export type AiAppBuilderExistingApp = Readonly<{
  readonly activeEnvironment: 'DEVELOPMENT' | 'PRODUCTION';
  readonly draft: AiAppBuilderDraft;
  readonly id: string;
  readonly published: boolean;
  readonly status: AiAppLifecycleStatus;
  readonly updatedAt: string;
  readonly versions: readonly Readonly<{
    readonly createdAt: string;
    readonly environment: 'DEVELOPMENT' | 'PRODUCTION';
    readonly version: string;
  }>[];
}>;

export type AiAppAccessSubject = Readonly<{
  readonly id: string;
  readonly label: string;
}>;

export type AiAppBuilderAccessSubjects = Readonly<{
  readonly departments: readonly AiAppAccessSubject[];
  readonly memberships: readonly AiAppAccessSubject[];
}>;
