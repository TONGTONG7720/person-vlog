import { MarketplaceReviewStatus } from '@/generated/prisma/client';
import { requireCmsDatabase } from '@/server/cms/database';
import { requireSaasPermission, type SaasContext } from '@/server/saas/auth';
import { requirePlanFeature, requirePlanLimit } from '@/server/saas/billing/entitlements';
import { SaasResourceNotFoundError } from '@/server/saas/project-errors';
import { saasPermissions } from '@/server/saas/rbac';
import { requireSafeMarketplaceContent } from '@/server/marketplace/content-safety';
import { canTransitionMarketplaceStatus } from '@/server/marketplace/contracts';
import { MarketplaceInputError, MarketplaceStateError } from '@/server/marketplace/errors';
import { toMarketplaceJson } from '@/server/marketplace/json';
import { validateMarketplacePluginPermissions } from '@/server/marketplace/plugin-security';
import {
  marketplaceAgentPackageSchema,
  type CreateMarketplaceItemInput,
  type MarketplaceItemVersionInput,
} from '@/server/marketplace/validation';

export type MarketplaceCreatorDashboard = Readonly<{
  readonly creator: Readonly<{
    readonly displayName: string;
    readonly verified: boolean;
  }> | null;
  readonly items: readonly Readonly<{
    readonly createdAt: Date;
    readonly favoriteCount: number;
    readonly id: string;
    readonly slug: string;
    readonly status: string;
    readonly title: string;
    readonly type: string;
    readonly updatedAt: Date;
    readonly usageCount: number;
  }>[];
  readonly metrics: Readonly<{
    readonly favorites: number;
    readonly published: number;
    readonly revenueCents: number;
    readonly submissions: number;
    readonly usage: number;
  }>;
}>;

export async function getMarketplaceCreatorDashboard(
  context: SaasContext,
): Promise<MarketplaceCreatorDashboard> {
  requireSaasPermission(context, saasPermissions.marketplacePublish);
  const database = requireCmsDatabase();
  const creator = await database.marketplaceCreator.findUnique({
    select: { displayName: true, id: true, verified: true },
    where: { userId: context.user.id },
  });

  if (creator === null) {
    return {
      creator: null,
      items: [],
      metrics: { favorites: 0, published: 0, revenueCents: 0, submissions: 0, usage: 0 },
    };
  }

  const [items, aggregate, revenues] = await Promise.all([
    database.marketplaceItem.findMany({
      orderBy: { updatedAt: 'desc' },
      select: {
        createdAt: true,
        favoriteCount: true,
        id: true,
        slug: true,
        status: true,
        title: true,
        type: true,
        updatedAt: true,
        usageCount: true,
      },
      where: { creatorId: creator.id, organizationId: context.organization.id },
    }),
    database.marketplaceItem.aggregate({
      _count: { _all: true },
      _sum: { favoriteCount: true, usageCount: true },
      where: { creatorId: creator.id, organizationId: context.organization.id },
    }),
    database.marketplaceRevenue.aggregate({
      _sum: { amountCents: true },
      where: { creatorId: creator.id },
    }),
  ]);

  return {
    creator: { displayName: creator.displayName, verified: creator.verified },
    items,
    metrics: {
      favorites: aggregate._sum.favoriteCount ?? 0,
      published: items.filter((item) => item.status === 'PUBLISHED').length,
      revenueCents: revenues._sum.amountCents ?? 0,
      submissions: aggregate._count._all,
      usage: aggregate._sum.usageCount ?? 0,
    },
  };
}

export async function createMarketplaceItem(
  context: SaasContext,
  input: CreateMarketplaceItemInput,
) {
  requireSaasPermission(context, saasPermissions.marketplacePublish);
  await requirePlanFeature(context, 'marketplacePublish');
  requireSafeMarketplaceContent(input);
  assertPackageVersionMatches(input);

  const database = requireCmsDatabase();
  const currentCount = await database.marketplaceItem.count({
    where: { organizationId: context.organization.id },
  });
  await requirePlanLimit(context, 'marketplaceItems', currentCount);

  const pluginPermissionDecision =
    input.plugin === undefined
      ? undefined
      : validateMarketplacePluginPermissions(input.plugin.permissions);

  if (pluginPermissionDecision?.kind === 'denied') {
    throw new MarketplaceInputError(
      `Plugin 包含不支持的权限：${pluginPermissionDecision.unsupported.join('、')}`,
    );
  }

  const creator = await database.marketplaceCreator.upsert({
    create: { displayName: getCreatorDisplayName(context.user.email), userId: context.user.id },
    select: { id: true },
    update: {},
    where: { userId: context.user.id },
  });

  return database.$transaction(async (transaction) => {
    const item = await transaction.marketplaceItem.create({
      data: {
        category: input.category,
        creatorId: creator.id,
        description: input.description,
        manifest: toMarketplaceJson(input.manifest),
        organizationId: context.organization.id,
        priceCents: input.priceCents ?? null,
        slug: input.slug,
        tags: input.tags,
        title: input.title,
        type: input.type,
      },
      select: { id: true, slug: true, status: true, title: true, type: true },
    });

    await transaction.marketplaceItemVersion.create({
      data: {
        changelog: input.changelog ?? null,
        content: toMarketplaceJson(input.manifest),
        createdByUserId: context.user.id,
        itemId: item.id,
        version: input.version,
      },
    });

    if (input.plugin !== undefined && pluginPermissionDecision?.kind === 'allowed') {
      await transaction.marketplacePlugin.create({
        data: {
          config: toMarketplaceJson(input.plugin.config),
          enabled: false,
          itemId: item.id,
          permissions: [...pluginPermissionDecision.permissions],
          type: input.plugin.type,
        },
      });
    }

    return item;
  });
}

export async function submitMarketplaceItemForReview(context: SaasContext, itemId: string) {
  requireSaasPermission(context, saasPermissions.marketplacePublish);
  const database = requireCmsDatabase();
  const item = await database.marketplaceItem.findFirst({
    select: { id: true, status: true },
    where: { id: itemId, organizationId: context.organization.id },
  });

  if (item === null) {
    throw new SaasResourceNotFoundError();
  }

  if (!canTransitionMarketplaceStatus({ from: item.status, to: 'REVIEW' })) {
    throw new MarketplaceStateError('该发布当前不能提交审核。');
  }

  return database.marketplaceItem.update({
    data: { reviewReason: null, status: 'REVIEW' },
    select: { id: true, status: true, title: true, updatedAt: true },
    where: { id: item.id },
  });
}

export async function createMarketplaceItemVersion(
  context: SaasContext,
  itemId: string,
  input: MarketplaceItemVersionInput,
) {
  requireSaasPermission(context, saasPermissions.marketplacePublish);
  await requirePlanFeature(context, 'marketplacePublish');
  const database = requireCmsDatabase();
  const item = await database.marketplaceItem.findFirst({
    select: {
      description: true,
      id: true,
      status: true,
      title: true,
      type: true,
    },
    where: { id: itemId, organizationId: context.organization.id },
  });

  if (item === null) {
    throw new SaasResourceNotFoundError();
  }

  requireSafeMarketplaceContent({
    description: item.description,
    manifest: input.manifest,
    title: item.title,
  });

  if (item.type === 'AGENT') {
    const agent = marketplaceAgentPackageSchema.safeParse(input.manifest);

    if (!agent.success || agent.data.version !== input.version) {
      throw new MarketplaceInputError('Agent 新版本必须包含完整发布包，且版本号必须一致。');
    }
  }

  const nextStatus = getVersionSubmissionStatus(item.status);

  if (!canTransitionMarketplaceStatus({ from: item.status, to: nextStatus })) {
    throw new MarketplaceStateError('当前审核状态不能直接创建新的版本。');
  }

  const existingVersion = await database.marketplaceItemVersion.findFirst({
    select: { id: true },
    where: { itemId: item.id, version: input.version },
  });

  if (existingVersion !== null) {
    throw new MarketplaceInputError('该版本号已经存在，请使用新的版本号。');
  }

  return database.$transaction(async (transaction) => {
    const version = await transaction.marketplaceItemVersion.create({
      data: {
        changelog: input.changelog ?? null,
        content: toMarketplaceJson(input.manifest),
        createdByUserId: context.user.id,
        itemId: item.id,
        version: input.version,
      },
      select: { createdAt: true, id: true, version: true },
    });
    const updatedItem = await transaction.marketplaceItem.update({
      data: {
        enabled: true,
        manifest: toMarketplaceJson(input.manifest),
        publishedAt: null,
        reviewReason: null,
        status: nextStatus,
      },
      select: { id: true, status: true, title: true, updatedAt: true },
      where: { id: item.id },
    });

    return { item: updatedItem, version };
  });
}

export async function toggleMarketplaceFavorite(context: SaasContext, itemId: string) {
  requireSaasPermission(context, saasPermissions.aiUse);
  const database = requireCmsDatabase();
  const item = await database.marketplaceItem.findFirst({
    select: { id: true },
    where: { enabled: true, id: itemId, publishedAt: { not: null }, status: 'PUBLISHED' },
  });

  if (item === null) {
    throw new SaasResourceNotFoundError();
  }

  return database.$transaction(async (transaction) => {
    const existing = await transaction.marketplaceFavorite.findUnique({
      select: { itemId: true },
      where: { itemId_userId: { itemId: item.id, userId: context.user.id } },
    });

    if (existing === null) {
      await Promise.all([
        transaction.marketplaceFavorite.create({
          data: { itemId: item.id, userId: context.user.id },
        }),
        transaction.marketplaceItem.update({
          data: { favoriteCount: { increment: 1 } },
          where: { id: item.id },
        }),
      ]);

      return { favorited: true };
    }

    await Promise.all([
      transaction.marketplaceFavorite.delete({
        where: { itemId_userId: { itemId: item.id, userId: context.user.id } },
      }),
      transaction.marketplaceItem.update({
        data: { favoriteCount: { decrement: 1 } },
        where: { id: item.id },
      }),
    ]);

    return { favorited: false };
  });
}

export async function createMarketplaceReview(
  context: SaasContext,
  input: Readonly<{
    readonly content?: string | undefined;
    readonly itemId: string;
    readonly rating: number;
  }>,
) {
  requireSaasPermission(context, saasPermissions.aiUse);
  const database = requireCmsDatabase();
  const item = await database.marketplaceItem.findFirst({
    select: { id: true },
    where: { enabled: true, id: input.itemId, publishedAt: { not: null }, status: 'PUBLISHED' },
  });

  if (item === null) {
    throw new SaasResourceNotFoundError();
  }

  return database.marketplaceReview.upsert({
    create: {
      content: input.content ?? null,
      itemId: item.id,
      rating: input.rating,
      status: MarketplaceReviewStatus.PENDING,
      userId: context.user.id,
    },
    select: { id: true, rating: true, status: true, updatedAt: true },
    update: {
      content: input.content ?? null,
      rating: input.rating,
      status: MarketplaceReviewStatus.PENDING,
    },
    where: { itemId_userId: { itemId: item.id, userId: context.user.id } },
  });
}

function assertPackageVersionMatches(input: CreateMarketplaceItemInput): void {
  if (input.type !== 'AGENT') {
    return;
  }

  const version = input.manifest['version'];

  if (version !== input.version) {
    throw new MarketplaceInputError('Agent 发布包中的版本号必须与本次发布版本一致。');
  }
}

function getCreatorDisplayName(email: string): string {
  const [localPart] = email.split('@');

  return localPart === undefined || localPart === '' ? 'Developer' : localPart.slice(0, 80);
}

function getVersionSubmissionStatus(
  status: 'DRAFT' | 'REVIEW' | 'PUBLISHED' | 'REJECTED' | 'ARCHIVED',
): 'DRAFT' | 'REVIEW' {
  switch (status) {
    case 'DRAFT':
    case 'REJECTED':
    case 'ARCHIVED':
      return 'DRAFT';
    case 'PUBLISHED':
      return 'REVIEW';
    case 'REVIEW':
      throw new MarketplaceStateError('正在审核的发布不能修改版本。');
  }
}
