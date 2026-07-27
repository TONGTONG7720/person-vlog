export const marketplacePluginPermissions = [
  'read_document',
  'call_api',
  'access_database',
] as const;

export type MarketplacePluginPermission = (typeof marketplacePluginPermissions)[number];

export type MarketplacePluginPermissionDecision =
  | Readonly<{
      readonly kind: 'allowed';
      readonly permissions: readonly MarketplacePluginPermission[];
    }>
  | Readonly<{ readonly kind: 'denied'; readonly unsupported: readonly string[] }>;

const allowedPluginPermissions = new Set<string>(marketplacePluginPermissions);

export function validateMarketplacePluginPermissions(
  permissions: readonly string[],
): MarketplacePluginPermissionDecision {
  const normalized = [
    ...new Set(permissions.map((permission) => permission.trim()).filter(Boolean)),
  ].sort();
  const unsupported = normalized.filter((permission) => !allowedPluginPermissions.has(permission));

  if (unsupported.length > 0) {
    return { kind: 'denied', unsupported };
  }

  return {
    kind: 'allowed',
    permissions: normalized.filter(isMarketplacePluginPermission),
  };
}

export function isMarketplacePluginPermission(value: string): value is MarketplacePluginPermission {
  return allowedPluginPermissions.has(value);
}
