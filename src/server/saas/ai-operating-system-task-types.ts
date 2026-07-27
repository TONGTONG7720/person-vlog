import type { AiTaskPlan } from '@/ai/orchestrator/ai-orchestrator';
import { requireCmsDatabase } from '@/server/cms/database';
import type { AiOperatingSystemExecutionScope } from '@/server/saas/ai-operating-system-scope';

export type CmsDatabase = ReturnType<typeof requireCmsDatabase>;

export type TaskExecutionState<TPlan extends AiTaskPlan = AiTaskPlan> = Readonly<{
  readonly database: CmsDatabase;
  readonly executionScope: AiOperatingSystemExecutionScope;
  readonly plan: TPlan;
  readonly request: string;
  readonly taskRunId: string;
  readonly workspaceId: string;
}>;

export type AiOperatingSystemTaskResult =
  | Readonly<{
      readonly approvalId: string;
      readonly kind: 'awaiting-approval';
      readonly taskRunId: string;
    }>
  | Readonly<{ readonly kind: 'completed'; readonly reportId: string; readonly taskRunId: string }>;
