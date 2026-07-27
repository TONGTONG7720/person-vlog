import { AiApprovalStatus, AiTraceEventType, AiWorkflowRunStatus } from '@/generated/prisma/client';
import { writeEnterpriseAuditLog } from '@/server/enterprise/audit';
import { requireCmsDatabase } from '@/server/cms/database';
import { requireSaasPermission, type SaasContext } from '@/server/saas/auth';
import { AiOperatingSystemApprovalStateError } from '@/server/saas/ai-operating-system-errors';
import { SaasResourceNotFoundError } from '@/server/saas/project-errors';
import { saasPermissions } from '@/server/saas/rbac';

export type ResolveAiApprovalInput = Readonly<{
  readonly approvalId: string;
  readonly decision: 'approve' | 'reject';
}>;

export async function resolveAiOperatingSystemApproval(
  context: SaasContext,
  input: ResolveAiApprovalInput,
): Promise<Readonly<{ readonly taskRunId: string }>> {
  requireSaasPermission(context, saasPermissions.aiManage);
  const database = requireCmsDatabase();
  const approval = await database.aiApprovalRequest.findFirst({
    select: { id: true, status: true, taskRunId: true, workspaceId: true },
    where: {
      enterpriseId: context.enterprise.id,
      id: input.approvalId,
      organizationId: context.organization.id,
    },
  });

  if (approval === null) {
    throw new SaasResourceNotFoundError();
  }

  if (approval.status !== AiApprovalStatus.PENDING) {
    throw new AiOperatingSystemApprovalStateError();
  }

  const approved = input.decision === 'approve';
  const outputSummary = approved
    ? '人工审批已确认。当前未配置外部业务工具适配器，因此 AIOS 未执行任何外部写入。'
    : '人工审批已拒绝，AIOS 未执行任何业务写入操作。';

  await database.$transaction(async (transaction) => {
    await transaction.aiApprovalRequest.update({
      data: {
        decisionNote: outputSummary,
        reviewedAt: new Date(),
        reviewedByMembershipId: context.membership.id,
        status: approved ? AiApprovalStatus.APPROVED : AiApprovalStatus.REJECTED,
      },
      where: { id: approval.id },
    });
    await transaction.aiTaskRun.update({
      data: {
        completedAt: new Date(),
        outputSummary,
        startedAt: new Date(),
        status: approved ? AiWorkflowRunStatus.APPROVED : AiWorkflowRunStatus.FAILED,
      },
      where: { id: approval.taskRunId },
    });
    await transaction.aiTaskTrace.createMany({
      data: [
        {
          enterpriseId: context.enterprise.id,
          event: AiTraceEventType.APPROVAL_RESOLVED,
          organizationId: context.organization.id,
          payload: { decision: input.decision },
          taskRunId: approval.taskRunId,
          workspaceId: approval.workspaceId,
        },
        {
          enterpriseId: context.enterprise.id,
          event: approved ? AiTraceEventType.TASK_COMPLETED : AiTraceEventType.TASK_FAILED,
          organizationId: context.organization.id,
          payload: { externalWriteExecuted: false },
          taskRunId: approval.taskRunId,
          workspaceId: approval.workspaceId,
        },
      ],
    });
  });
  await writeEnterpriseAuditLog({
    action: approved ? 'aios.approval.approved' : 'aios.approval.rejected',
    enterpriseId: context.enterprise.id,
    organizationId: context.organization.id,
    resource: 'ai_approval_request',
    resourceId: approval.id,
    userId: context.user.id,
  });

  return { taskRunId: approval.taskRunId };
}
