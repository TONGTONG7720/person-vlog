import { MarketplaceInputError } from '@/server/marketplace/errors';
import {
  isMarketplacePluginPermission,
  validateMarketplacePluginPermissions,
  type MarketplacePluginPermission,
} from '@/server/marketplace/plugin-security';

export type MarketplaceToolRequest = Readonly<{
  readonly permission: string;
  readonly pluginId: string;
}>;

export type MarketplaceToolRoute = Readonly<{
  readonly permission: MarketplacePluginPermission;
  readonly pluginId: string;
}>;

/**
 * V1 only resolves a declared, approved capability. Plugin code is intentionally
 * not executed in-process; a future isolated worker can consume this route.
 */
export function resolveMarketplaceToolRoute(
  request: MarketplaceToolRequest,
  declaredPermissions: readonly string[],
): MarketplaceToolRoute {
  const permissions = validateMarketplacePluginPermissions(declaredPermissions);

  if (permissions.kind === 'denied' || !isMarketplacePluginPermission(request.permission)) {
    throw new MarketplaceInputError('Plugin 请求了未声明或不受支持的权限。');
  }

  if (!permissions.permissions.includes(request.permission)) {
    throw new MarketplaceInputError('Plugin 只能使用已经审核通过的最小权限集。');
  }

  return { permission: request.permission, pluginId: request.pluginId };
}
