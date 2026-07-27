import { AiTraceEventType, AiWorkflowRunStatus } from '@/generated/prisma/client';
import { createTaskKnowledgeEntityName } from '@/ai/knowledge-graph/knowledge-graph';
import { generateAiOperatingSystemReport } from '@/server/saas/ai-operating-system-generation';
import { writeEnterpriseAuditLog } from '@/server/enterprise/audit';
import { retrieveAiWorkspaceKnowledge } from '@/server/saas/ai-rag';
import type {
  AiOperatingSystemTaskResult,
  TaskExecutionState,
} from '@/server/saas/ai-operating-system-task-types';

export async function appendTaskKnowledgeEntity(state: TaskExecutionState): Promise<void> {
  const name = createTaskKnowledgeEntityName(state.request);
  const entity = await state.database.aiKnowledgeEntity.upsert({
    create: {
      enterpriseId: state.executionScope.tenant.enterpriseId,
      metadata: { taskRunId: state.taskRunId },
      name,
      organizationId: state.executionScope.tenant.organizationId,
      type: 'ai_task',
      workspaceId: state.workspaceId,
    },
    update: { metadata: { taskRunId: state.taskRunId } },
    where: { workspaceId_type_name: { name, type: 'ai_task', workspaceId: state.workspaceId } },
  });
  const workspaceEntity = await state.database.aiKnowledgeEntity.findFirst({
    select: { id: true },
    where: {
      enterpriseId: state.executionScope.tenant.enterpriseId,
      organizationId: state.executionScope.tenant.organizationId,
      type: 'workspace',
      workspaceId: state.workspaceId,
    },
  });

  if (workspaceEntity !== null) {
    await state.database.aiKnowledgeRelation.upsert({
      create: {
        enterpriseId: state.executionScope.tenant.enterpriseId,
        organizationId: state.executionScope.tenant.organizationId,
        relation: 'received_task',
        sourceId: workspaceEntity.id,
        targetId: entity.id,
        workspaceId: state.workspaceId,
      },
      update: {},
      where: {
        sourceId_targetId_relation: {
          relation: 'received_task',
          sourceId: workspaceEntity.id,
          targetId: entity.id,
        },
      },
    });
  }
}

export async function createApprovalTask(
  state: TaskExecutionState,
): Promise<AiOperatingSystemTaskResult> {
  const approval = await state.database.$transaction(async (transaction) => {
    const createdApproval = await transaction.aiApprovalRequest.create({
      data: {
        enterpriseId: state.executionScope.tenant.enterpriseId,
        organizationId: state.executionScope.tenant.organizationId,
        payload: { intent: state.plan.intent, requestSummary: state.request },
        taskRunId: state.taskRunId,
        toolKey: state.plan.toolKey ?? 'project.task.create',
        workspaceId: state.workspaceId,
      },
    });
    await transaction.aiTaskRun.update({
      data: { status: AiWorkflowRunStatus.AWAITING_APPROVAL },
      where: { id: state.taskRunId },
    });
    await transaction.aiTaskTrace.create({
      data: {
        enterpriseId: state.executionScope.tenant.enterpriseId,
        event: AiTraceEventType.APPROVAL_REQUIRED,
        organizationId: state.executionScope.tenant.organizationId,
        payload: { approvalId: createdApproval.id, toolKey: createdApproval.toolKey },
        taskRunId: state.taskRunId,
        toolKey: createdApproval.toolKey,
        workspaceId: state.workspaceId,
      },
    });

    return createdApproval;
  });
  await writeTaskAuditLog(state, 'aios.task.approval_required');

  return { approvalId: approval.id, kind: 'awaiting-approval', taskRunId: state.taskRunId };
}

export async function completeReadOnlyAiTask(
  state: TaskExecutionState,
): Promise<AiOperatingSystemTaskResult> {
  await state.database.aiTaskTrace.create({
    data: {
      enterpriseId: state.executionScope.tenant.enterpriseId,
      event: AiTraceEventType.TOOL_CALLED,
      organizationId: state.executionScope.tenant.organizationId,
      payload: { queryLength: state.request.length },
      taskRunId: state.taskRunId,
      toolKey: 'knowledge.search',
      workspaceId: state.workspaceId,
    },
  });
  const knowledge = await retrieveAiWorkspaceKnowledge({
    enterpriseId: state.executionScope.tenant.enterpriseId,
    organizationId: state.executionScope.tenant.organizationId,
    query: state.request,
    role: getRetrievalRole(state),
    similarityThreshold: 0,
    topK: 5,
    workspaceId: state.workspaceId,
  });
  const content = await generateAiOperatingSystemReport({
    database: state.database,
    enterpriseId: state.executionScope.tenant.enterpriseId,
    knowledge,
    organizationId: state.executionScope.tenant.organizationId,
    plan: state.plan,
    requestSummary: state.request,
    workspaceId: state.workspaceId,
  });
  const report = await state.database.$transaction(async (transaction) => {
    const createdReport = await transaction.aiReport.create({
      data: {
        content,
        enterpriseId: state.executionScope.tenant.enterpriseId,
        organizationId: state.executionScope.tenant.organizationId,
        taskRunId: state.taskRunId,
        title: `AIOS · ${state.request.slice(0, 48)}`,
        workspaceId: state.workspaceId,
      },
    });
    await transaction.aiTaskRun.update({
      data: {
        completedAt: new Date(),
        outputSummary: '已生成可复核的 AIOS 任务摘要。',
        status: AiWorkflowRunStatus.COMPLETED,
      },
      where: { id: state.taskRunId },
    });
    await transaction.aiTaskTrace.createMany({
      data: [
        ...state.plan.agentRoles.map((role) => ({
          enterpriseId: state.executionScope.tenant.enterpriseId,
          event: AiTraceEventType.AGENT_COMPLETED,
          organizationId: state.executionScope.tenant.organizationId,
          payload: { role },
          taskRunId: state.taskRunId,
          workspaceId: state.workspaceId,
        })),
        {
          enterpriseId: state.executionScope.tenant.enterpriseId,
          event: AiTraceEventType.TASK_COMPLETED,
          organizationId: state.executionScope.tenant.organizationId,
          payload: { reportId: createdReport.id, sourceCount: knowledge.sources.length },
          taskRunId: state.taskRunId,
          workspaceId: state.workspaceId,
        },
      ],
    });

    return createdReport;
  });
  await writeTaskAuditLog(state, 'aios.task.completed');

  return { kind: 'completed', reportId: report.id, taskRunId: state.taskRunId };
}

export async function markTaskAsBlocked(
  state: TaskExecutionState,
  outputSummary: string,
): Promise<void> {
  await state.database.$transaction(async (transaction) => {
    await transaction.aiTaskRun.update({
      data: {
        completedAt: new Date(),
        outputSummary,
        startedAt: new Date(),
        status: AiWorkflowRunStatus.FAILED,
      },
      where: { id: state.taskRunId },
    });
    await transaction.aiTaskTrace.create({
      data: {
        enterpriseId: state.executionScope.tenant.enterpriseId,
        event: AiTraceEventType.TASK_FAILED,
        organizationId: state.executionScope.tenant.organizationId,
        payload: { reason: outputSummary },
        taskRunId: state.taskRunId,
        workspaceId: state.workspaceId,
      },
    });
  });
  await writeTaskAuditLog(state, 'aios.task.blocked');
}

function getRetrievalRole(state: TaskExecutionState) {
  switch (state.executionScope.actor.kind) {
    case 'api-key':
      return undefined;
    case 'member':
      return state.executionScope.actor.role;
  }
}

async function writeTaskAuditLog(state: TaskExecutionState, action: string): Promise<void> {
  switch (state.executionScope.actor.kind) {
    case 'api-key':
      await writeEnterpriseAuditLog({
        action,
        enterpriseId: state.executionScope.tenant.enterpriseId,
        metadata: { apiKeyId: state.executionScope.actor.apiKeyId },
        organizationId: state.executionScope.tenant.organizationId,
        resource: 'ai_task_run',
        resourceId: state.taskRunId,
      });
      return;
    case 'member':
      await writeEnterpriseAuditLog({
        action,
        enterpriseId: state.executionScope.tenant.enterpriseId,
        organizationId: state.executionScope.tenant.organizationId,
        resource: 'ai_task_run',
        resourceId: state.taskRunId,
        userId: state.executionScope.actor.userId,
      });
  }
}
