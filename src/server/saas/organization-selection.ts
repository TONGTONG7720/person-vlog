type OrganizationMembership = Readonly<{
  readonly organization: Readonly<{
    readonly slug: string;
  }>;
}>;

export function selectSaasOrganizationMembership<T extends OrganizationMembership>(
  memberships: readonly T[],
  organizationSlug: string | undefined,
): T | undefined {
  if (organizationSlug === undefined) {
    return memberships[0];
  }

  return memberships.find((membership) => membership.organization.slug === organizationSlug);
}
