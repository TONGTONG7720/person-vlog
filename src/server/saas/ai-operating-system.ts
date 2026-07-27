import { authorizeEnterpriseGatewayRequest } from '@/server/enterprise/gateway-service';
import type { AiApiKeyIdentity } from '@/server/saas/ai-api-keys';
import { requireSaasPermission, type SaasContext } from '@/server/saas/auth';
import {
  requireOrganizationPlanFeature,
  requirePlanFeature,
} from '@/server/saas/billing/entitlements';
import {
  resolveAiOperatingSystemApproval,
  type ResolveAiApprovalInput,
} from '@/server/saas/ai-operating-system-approval';
import {
  createAiOperatingSystemApiKeyExecutionScope,
  createAiOperatingSystemMemberExecutionScope,
} from '@/server/saas/ai-operating-system-scope';
import {
  executeAiOperatingSystemTask,
  type AiOperatingSystemTaskResult,
} from '@/server/saas/ai-operating-system-task-runner';
import { saasPermissions } from '@/server/saas/rbac';
import type { AiOperatingSystemTaskRequest } from '@/server/saas/ai-operating-system-validation';

export type { AiOperatingSystemTaskResult, ResolveAiApprovalInput };
export { resolveAiOperatingSystemApproval };

export async function queueAiOperatingSystemTask(
  context: SaasContext,
  input: AiOperatingSystemTaskRequest,
): Promise<AiOperatingSystemTaskResult> {
  requireSaasPermission(context, saasPermissions.agentExecute);
  await requirePlanFeature(context, 'aiWorkspace');

  return executeAiOperatingSystemTask({
    executionScope: createAiOperatingSystemMemberExecutionScope({
      enterpriseId: context.enterprise.id,
      membershipId: context.membership.id,
      organizationId: context.organization.id,
      role: context.membership.role,
      userId: context.user.id,
    }),
    task: input,
  });
}

export async function queueAiOperatingSystemTaskForApiKey(
  apiKey: AiApiKeyIdentity,
  input: AiOperatingSystemTaskRequest,
): Promise<AiOperatingSystemTaskResult> {
  authorizeEnterpriseGatewayRequest(apiKey, 'agent.execute');
  await requireOrganizationPlanFeature(apiKey.organizationId, 'apiAccess');

  return executeAiOperatingSystemTask({
    executionScope: createAiOperatingSystemApiKeyExecutionScope({
      apiKeyId: apiKey.id,
      enterpriseId: apiKey.enterpriseId,
      organizationId: apiKey.organizationId,
    }),
    task: input,
  });
}
