import { AiTraceEventType } from '@/generated/prisma/client';
import { isSafeAiAutomationInput } from '@/ai/lib/automation-safety';
import { planAiTask, type AiTaskPlan } from '@/ai/orchestrator/ai-orchestrator';
import { requireCmsDatabase } from '@/server/cms/database';
import { ensureAiOperatingSystemDefaults } from '@/server/saas/ai-operating-system-bootstrap';
import { AiOperatingSystemInputError } from '@/server/saas/ai-operating-system-errors';
import type { AiOperatingSystemExecutionScope } from '@/server/saas/ai-operating-system-scope';
import {
  appendTaskKnowledgeEntity,
  completeReadOnlyAiTask,
  createApprovalTask,
  markTaskAsBlocked,
} from '@/server/saas/ai-operating-system-task-execution';
import { recordShortTermTaskMemory } from '@/server/saas/ai-operating-system-task-memory';
import type {
  AiOperatingSystemTaskResult,
  CmsDatabase,
  TaskExecutionState,
} from '@/server/saas/ai-operating-system-task-types';
import { SaasResourceNotFoundError } from '@/server/saas/project-errors';
import { hasSaasPermission, saasPermissions } from '@/server/saas/rbac';
import type { AiOperatingSystemTaskRequest } from '@/server/saas/ai-operating-system-validation';

export type { AiOperatingSystemTaskResult } from '@/server/saas/ai-operating-system-task-types';

export async function executeAiOperatingSystemTask(
  input: Readonly<{
    readonly executionScope: AiOperatingSystemExecutionScope;
    readonly task: AiOperatingSystemTaskRequest;
  }>,
): Promise<AiOperatingSystemTaskResult> {
  if (!isSafeAiAutomationInput(input.task.request)) {
    throw new AiOperatingSystemInputError('任务内容不符合企业 AI 执行边界。');
  }

  const database = requireCmsDatabase();
  await ensureAiOperatingSystemDefaults(
    database,
    input.executionScope.tenant,
    input.task.workspaceId,
  );

  const plan = planAiTask({
    hasProjectWritePermission: hasProjectWritePermission(input.executionScope),
    request: input.task.request,
  });
  await requireGovernedPlan(database, input.executionScope, plan);

  const workflow = await database.aiWorkflow.findFirst({
    select: { id: true },
    where: {
      enabled: true,
      enterpriseId: input.executionScope.tenant.enterpriseId,
      ...(input.task.workflowId === undefined
        ? { name: '企业 AI 任务处理' }
        : { id: input.task.workflowId }),
      organizationId: input.executionScope.tenant.organizationId,
      workspaceId: input.task.workspaceId,
    },
  });

  if (workflow === null) {
    throw new SaasResourceNotFoundError();
  }

  const taskRun = await database.aiTaskRun.create({
    data: {
      agentPlan: {
        agentRoles: plan.agentRoles,
        intent: plan.intent,
        requiresApproval: plan.requiresApproval,
        ...(plan.intent === 'action' ? { toolExecution: plan.toolExecution } : {}),
      },
      enterpriseId: input.executionScope.tenant.enterpriseId,
      organizationId: input.executionScope.tenant.organizationId,
      requestSummary: input.task.request,
      ...getTaskRequester(input.executionScope),
      ...(plan.toolKey === undefined ? {} : { toolKey: plan.toolKey }),
      workflowId: workflow.id,
      workspaceId: input.task.workspaceId,
    },
  });
  const state: TaskExecutionState = {
    database,
    executionScope: input.executionScope,
    plan,
    request: input.task.request,
    taskRunId: taskRun.id,
    workspaceId: input.task.workspaceId,
  };

  await database.$transaction(async (transaction) => {
    await transaction.aiTaskRun.update({
      data: { startedAt: new Date(), status: 'RUNNING' },
      where: { id: taskRun.id },
    });
    await transaction.aiTaskTrace.createMany({
      data: [
        {
          enterpriseId: input.executionScope.tenant.enterpriseId,
          event: AiTraceEventType.TASK_QUEUED,
          organizationId: input.executionScope.tenant.organizationId,
          payload: { intent: plan.intent, roles: plan.agentRoles },
          taskRunId: taskRun.id,
          workspaceId: input.task.workspaceId,
        },
        ...plan.agentRoles.map((role) => ({
          enterpriseId: input.executionScope.tenant.enterpriseId,
          event: AiTraceEventType.AGENT_STARTED,
          organizationId: input.executionScope.tenant.organizationId,
          payload: { role },
          taskRunId: taskRun.id,
          workspaceId: input.task.workspaceId,
        })),
      ],
    });
  });
  await appendTaskKnowledgeEntity(state);
  await recordShortTermTaskMemory(state);

  switch (plan.intent) {
    case 'action':
      return executeActionPlan({ ...state, plan });
    case 'analysis':
    case 'general':
    case 'knowledge':
      return completeReadOnlyAiTask(state);
  }
}

async function executeActionPlan(
  state: TaskExecutionState<Extract<AiTaskPlan, Readonly<{ readonly intent: 'action' }>>>,
): Promise<AiOperatingSystemTaskResult> {
  switch (state.plan.toolExecution) {
    case 'approval-required':
      return createApprovalTask(state);
    case 'execute':
      await markTaskAsBlocked(state, '当前企业工具尚未配置为可直接执行。');
      throw new AiOperatingSystemInputError('当前企业工具尚未配置为可直接执行。');
    case 'forbidden':
      await markTaskAsBlocked(state, '当前执行身份不具备项目写入权限。');
      throw new AiOperatingSystemInputError('当前执行身份不具备项目写入权限。');
  }
}

async function requireGovernedPlan(
  database: CmsDatabase,
  executionScope: AiOperatingSystemExecutionScope,
  plan: AiTaskPlan,
): Promise<void> {
  const policy = await database.aiGovernancePolicy.findUnique({
    where: { organizationId: executionScope.tenant.organizationId },
  });

  if (policy === null || plan.agentRoles.some((role) => !policy.enabledAgentRoles.includes(role))) {
    throw new AiOperatingSystemInputError('当前企业治理策略未启用所需 AI Agent。');
  }

  switch (plan.intent) {
    case 'action':
      if (!policy.enabledToolKeys.includes(plan.toolKey)) {
        throw new AiOperatingSystemInputError('当前企业治理策略未启用该业务工具。');
      }
      if (plan.requiresApproval && !policy.requireHumanApproval) {
        throw new AiOperatingSystemInputError('高风险业务工具必须启用人工审批策略。');
      }
      return;
    case 'analysis':
    case 'general':
    case 'knowledge':
      return;
  }
}

function hasProjectWritePermission(executionScope: AiOperatingSystemExecutionScope): boolean {
  switch (executionScope.actor.kind) {
    case 'api-key':
      return false;
    case 'member':
      return hasSaasPermission(executionScope.actor.role, saasPermissions.projectWrite);
  }
}

function getTaskRequester(
  executionScope: AiOperatingSystemExecutionScope,
): Readonly<Record<string, string>> {
  switch (executionScope.actor.kind) {
    case 'api-key':
      return {};
    case 'member':
      return { requestedByMembershipId: executionScope.actor.membershipId };
  }
}
