import type { SaasRole } from '@/server/saas/rbac';

export type AiOperatingSystemTenantScope = Readonly<{
  readonly enterpriseId: string;
  readonly organizationId: string;
}>;

export type AiOperatingSystemTaskActor =
  | Readonly<{
      readonly kind: 'member';
      readonly membershipId: string;
      readonly role: SaasRole;
      readonly userId: string;
    }>
  | Readonly<{
      readonly apiKeyId: string;
      readonly kind: 'api-key';
    }>;

export type AiOperatingSystemExecutionScope = Readonly<{
  readonly actor: AiOperatingSystemTaskActor;
  readonly tenant: AiOperatingSystemTenantScope;
}>;

type CreateMemberExecutionScopeInput = Readonly<{
  readonly enterpriseId: string;
  readonly membershipId: string;
  readonly organizationId: string;
  readonly role: SaasRole;
  readonly userId: string;
}>;

type CreateApiKeyExecutionScopeInput = Readonly<{
  readonly apiKeyId: string;
  readonly enterpriseId: string;
  readonly organizationId: string;
}>;

export function createAiOperatingSystemMemberExecutionScope(
  input: CreateMemberExecutionScopeInput,
): AiOperatingSystemExecutionScope {
  return {
    actor: {
      kind: 'member',
      membershipId: input.membershipId,
      role: input.role,
      userId: input.userId,
    },
    tenant: { enterpriseId: input.enterpriseId, organizationId: input.organizationId },
  };
}

export function createAiOperatingSystemApiKeyExecutionScope(
  input: CreateApiKeyExecutionScopeInput,
): AiOperatingSystemExecutionScope {
  return {
    actor: { apiKeyId: input.apiKeyId, kind: 'api-key' },
    tenant: { enterpriseId: input.enterpriseId, organizationId: input.organizationId },
  };
}
