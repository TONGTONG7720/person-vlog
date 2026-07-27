export type EnterpriseScope = Readonly<{
  readonly enterpriseId: string;
  readonly organizationId: string;
  readonly workspaceId?: string;
}>;

export type EnterpriseScopedResource = Readonly<{
  readonly enterpriseId: string;
  readonly organizationId: string;
  readonly workspaceId?: string;
}>;

export function createEnterpriseScope(input: EnterpriseScope): EnterpriseScope {
  return {
    enterpriseId: input.enterpriseId,
    organizationId: input.organizationId,
    ...(input.workspaceId === undefined ? {} : { workspaceId: input.workspaceId }),
  };
}

export function canAccessEnterpriseResource(
  context: EnterpriseScope,
  resource: EnterpriseScopedResource,
): boolean {
  if (
    context.enterpriseId !== resource.enterpriseId ||
    context.organizationId !== resource.organizationId
  ) {
    return false;
  }

  return (
    context.workspaceId === undefined ||
    resource.workspaceId === undefined ||
    context.workspaceId === resource.workspaceId
  );
}

export function enterpriseWorkspaceWhere(
  input: Required<EnterpriseScope>,
): Required<EnterpriseScope> {
  return {
    enterpriseId: input.enterpriseId,
    organizationId: input.organizationId,
    workspaceId: input.workspaceId,
  };
}
