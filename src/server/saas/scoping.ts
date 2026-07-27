export type TenantResource = Readonly<{
  readonly enterpriseId: string;
  readonly organizationId: string;
}>;

export function isTenantResourceAccessible(
  context: TenantResource,
  resource: TenantResource,
): boolean {
  return context.organizationId === resource.organizationId;
}

export function tenantProjectWhere(
  input: Readonly<{
    readonly enterpriseId: string;
    readonly organizationId: string;
    readonly projectId: string;
  }>,
): Readonly<{
  readonly enterpriseId: string;
  readonly id: string;
  readonly organizationId: string;
}> {
  return {
    enterpriseId: input.enterpriseId,
    id: input.projectId,
    organizationId: input.organizationId,
  };
}
