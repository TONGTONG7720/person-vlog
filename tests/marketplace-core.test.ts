import { describe, expect, it } from 'vitest';

import {
  canTransitionMarketplaceStatus,
  isPublicMarketplaceItem,
  type MarketplaceVisibilityCandidate,
} from '../src/server/marketplace/contracts';
import { canUseFeature, checkPlanLimit, parsePlanEntitlements } from '../src/lib/permissions';
import { validateMarketplacePluginPermissions } from '../src/server/marketplace/plugin-security';
import { meteredPlanFeatures } from '../src/server/saas/billing/usage';

describe('AI Developer Marketplace 核心边界', () => {
  it('只公开已审核、已发布且启用的市场条目', () => {
    const publishedItem: MarketplaceVisibilityCandidate = {
      enabled: true,
      publishedAt: new Date('2026-07-26T00:00:00.000Z'),
      status: 'PUBLISHED',
    };

    expect(isPublicMarketplaceItem(publishedItem)).toBe(true);
    expect(isPublicMarketplaceItem({ ...publishedItem, enabled: false })).toBe(false);
    expect(isPublicMarketplaceItem({ ...publishedItem, status: 'REVIEW' })).toBe(false);
  });

  it('要求人工审核后才能发布，并允许审核后的归档', () => {
    expect(canTransitionMarketplaceStatus({ from: 'DRAFT', to: 'PUBLISHED' })).toBe(false);
    expect(canTransitionMarketplaceStatus({ from: 'DRAFT', to: 'REVIEW' })).toBe(true);
    expect(canTransitionMarketplaceStatus({ from: 'REVIEW', to: 'PUBLISHED' })).toBe(true);
    expect(canTransitionMarketplaceStatus({ from: 'PUBLISHED', to: 'ARCHIVED' })).toBe(true);
  });

  it('只允许声明过的 Plugin 权限，并拒绝未知权限', () => {
    expect(
      validateMarketplacePluginPermissions(['read_document', 'call_api', 'read_document']),
    ).toEqual({ kind: 'allowed', permissions: ['call_api', 'read_document'] });
    expect(validateMarketplacePluginPermissions(['access_database', 'root_shell'])).toEqual({
      kind: 'denied',
      unsupported: ['root_shell'],
    });
  });

  it('将市场发布与 Developer API 限额和原有 SaaS 套餐分开计量', () => {
    const entitlements = parsePlanEntitlements({
      features: {
        aiWorkspace: true,
        apiAccess: true,
        developerApi: true,
        marketplacePublish: true,
        privateKnowledge: false,
        prioritySupport: false,
      },
      limits: {
        aiAssistants: 1,
        aiDocuments: 3,
        aiMessages: 100,
        aiTokens: 10_000,
        marketplaceApiRequests: 20,
        marketplaceItems: 2,
        members: 1,
        projects: 2,
        storageBytes: 1_024,
        workspaces: 1,
      },
    });

    expect(canUseFeature(entitlements, 'marketplacePublish')).toBe(true);
    expect(
      checkPlanLimit({
        current: 20,
        entitlements,
        feature: 'marketplaceApiRequests',
        requested: 1,
      }),
    ).toEqual({ kind: 'limit-reached', limit: 20, used: 20 });
  });

  it('把 Developer API 请求作为独立月度计量项', () => {
    expect(meteredPlanFeatures).toContain('marketplaceApiRequests');
  });
});
