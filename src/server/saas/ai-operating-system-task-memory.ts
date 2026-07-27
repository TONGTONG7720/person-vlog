import { AiAgentMemoryType, AiOperatingAgentRole } from '@/generated/prisma/client';
import { createTaskMemoryContent } from '@/ai/memory/agent-memory';
import type { AiAgentRole } from '@/ai/operating-system/contracts';
import type { TaskExecutionState } from '@/server/saas/ai-operating-system-task-types';

const agentRoleToPrisma = {
  action: AiOperatingAgentRole.ACTION,
  data: AiOperatingAgentRole.DATA,
  planner: AiOperatingAgentRole.PLANNER,
  research: AiOperatingAgentRole.RESEARCH,
  writer: AiOperatingAgentRole.WRITER,
} as const satisfies Readonly<Record<AiAgentRole, AiOperatingAgentRole>>;

const prismaRoleToAgent = {
  [AiOperatingAgentRole.ACTION]: 'action',
  [AiOperatingAgentRole.DATA]: 'data',
  [AiOperatingAgentRole.PLANNER]: 'planner',
  [AiOperatingAgentRole.RESEARCH]: 'research',
  [AiOperatingAgentRole.WRITER]: 'writer',
} as const satisfies Readonly<Record<AiOperatingAgentRole, AiAgentRole>>;

export async function recordShortTermTaskMemory(state: TaskExecutionState): Promise<void> {
  const agentRoles = state.plan.agentRoles.map((role) => agentRoleToPrisma[role]);
  const agents = await state.database.aiAgent.findMany({
    select: { id: true, role: true },
    where: {
      enterpriseId: state.executionScope.tenant.enterpriseId,
      organizationId: state.executionScope.tenant.organizationId,
      role: { in: agentRoles },
      workspaceId: state.workspaceId,
    },
  });

  if (agents.length === 0) {
    return;
  }

  await state.database.aiAgentMemory.createMany({
    data: agents.map((agent) => ({
      agentId: agent.id,
      content: createTaskMemoryContent({
        agentRole: prismaRoleToAgent[agent.role],
        requestSummary: state.request,
      }),
      enterpriseId: state.executionScope.tenant.enterpriseId,
      organizationId: state.executionScope.tenant.organizationId,
      type: AiAgentMemoryType.SHORT_TERM,
      workspaceId: state.workspaceId,
    })),
  });
}
