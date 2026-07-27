import { selectAgentTeam } from '@/ai/agents/team/default-team';
import type { AiAgentRole } from '@/ai/operating-system/contracts';
import { decideToolExecution } from '@/ai/tools/tool-registry';

type AiTaskIntent = 'action' | 'analysis' | 'general' | 'knowledge';

type PlanAiTaskInput = Readonly<{
  readonly hasProjectWritePermission: boolean;
  readonly request: string;
}>;

export type AiTaskPlan =
  | Readonly<{
      readonly agentRoles: readonly AiAgentRole[];
      readonly intent: Exclude<AiTaskIntent, 'action'>;
      readonly requiresApproval: false;
      readonly toolKey?: undefined;
    }>
  | Readonly<{
      readonly agentRoles: readonly AiAgentRole[];
      readonly intent: 'action';
      readonly requiresApproval: false;
      readonly toolKey: 'project.task.create';
      readonly toolExecution: 'execute' | 'forbidden';
    }>
  | Readonly<{
      readonly agentRoles: readonly AiAgentRole[];
      readonly intent: 'action';
      readonly requiresApproval: true;
      readonly toolKey: 'project.task.create';
      readonly toolExecution: 'approval-required';
    }>;

const actionRequestKeywords = ['创建任务', '项目跟进任务', '安排跟进', '创建线索'] as const;

export function planAiTask(input: PlanAiTaskInput): AiTaskPlan {
  const agentRoles = selectAgentTeam({ request: input.request });

  if (includesAny(input.request, actionRequestKeywords)) {
    const decision = decideToolExecution({
      hasRequiredPermission: input.hasProjectWritePermission,
      toolKey: 'project.task.create',
    });

    switch (decision.kind) {
      case 'approval-required':
        return {
          agentRoles,
          intent: 'action',
          requiresApproval: true,
          toolKey: 'project.task.create',
          toolExecution: decision.kind,
        };
      case 'execute':
      case 'forbidden':
        return {
          agentRoles,
          intent: 'action',
          requiresApproval: false,
          toolKey: 'project.task.create',
          toolExecution: decision.kind,
        };
    }
  }

  return {
    agentRoles,
    intent: getAiTaskIntent(agentRoles),
    requiresApproval: false,
  };
}

function getAiTaskIntent(agentRoles: readonly AiAgentRole[]): Exclude<AiTaskIntent, 'action'> {
  if (agentRoles.includes('data')) {
    return 'analysis';
  }

  if (agentRoles.includes('research')) {
    return 'knowledge';
  }

  return 'general';
}

function includesAny(value: string, keywords: readonly string[]): boolean {
  return keywords.some((keyword) => value.includes(keyword));
}
