import type { AiTaskPlan } from '@/ai/orchestrator/ai-orchestrator';

export type AiTaskDispatchDecision =
  Readonly<{ readonly kind: 'awaiting-approval' }> | Readonly<{ readonly kind: 'ready-to-run' }>;

export function decideAiTaskDispatch(plan: AiTaskPlan): AiTaskDispatchDecision {
  return plan.requiresApproval ? { kind: 'awaiting-approval' } : { kind: 'ready-to-run' };
}
