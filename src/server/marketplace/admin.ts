import type { MarketplaceItemStatus } from '@/generated/prisma/client';
import { getCmsDatabase, requireCmsDatabase } from '@/server/cms/database';
import { canTransitionMarketplaceStatus } from '@/server/marketplace/contracts';
import { MarketplaceStateError } from '@/server/marketplace/errors';

const adminMarketplacePageSize = 12;

export type AdminMarketplaceOverview = Readonly<{
  readonly items: ReadonlyArray<
    Readonly<{
      readonly category: string;
      readonly createdAt: Date;
      readonly creatorName: string;
      readonly id: string;
      readonly reviewReason: string | null;
      readonly slug: string;
      readonly status: MarketplaceItemStatus;
      readonly title: string;
      readonly type: string;
    }>
  >;
  readonly page: number;
  readonly pendingCount: number;
}>;

type AdminMarketplaceQuery = Readonly<{
  readonly page?: number;
  readonly search?: string;
}>;

export async function getAdminMarketplaceOverview(
  query: AdminMarketplaceQuery = {},
): Promise<AdminMarketplaceOverview | undefined> {
  const database = getCmsDatabase();

  if (database === undefined) {
    return undefined;
  }

  const page = normalizePage(query.page);
  const search = query.search?.trim();
  const where =
    search === undefined || search === ''
      ? {}
      : {
          OR: [
            { creator: { displayName: { contains: search, mode: 'insensitive' as const } } },
            { slug: { contains: search, mode: 'insensitive' as const } },
            { title: { contains: search, mode: 'insensitive' as const } },
          ],
        };
  const [items, pendingCount] = await Promise.all([
    database.marketplaceItem.findMany({
      orderBy: [{ status: 'asc' }, { updatedAt: 'desc' }],
      select: {
        category: true,
        createdAt: true,
        creator: { select: { displayName: true } },
        id: true,
        reviewReason: true,
        slug: true,
        status: true,
        title: true,
        type: true,
      },
      skip: (page - 1) * adminMarketplacePageSize,
      take: adminMarketplacePageSize,
      where,
    }),
    database.marketplaceItem.count({ where: { status: 'REVIEW' } }),
  ]);

  return {
    items: items.map((item) => ({
      category: item.category,
      createdAt: item.createdAt,
      creatorName: item.creator.displayName,
      id: item.id,
      reviewReason: item.reviewReason,
      slug: item.slug,
      status: item.status,
      title: item.title,
      type: item.type,
    })),
    page,
    pendingCount,
  };
}

type ModerateMarketplaceItemInput = Readonly<{
  readonly itemId: string;
  readonly reason?: string | undefined;
  readonly reviewerEmail: string;
  readonly status: Extract<MarketplaceItemStatus, 'PUBLISHED' | 'REJECTED' | 'ARCHIVED'>;
}>;

export async function moderateMarketplaceItem(input: ModerateMarketplaceItemInput) {
  const database = requireCmsDatabase();
  const [item, reviewer] = await Promise.all([
    database.marketplaceItem.findUnique({
      select: { id: true, status: true, type: true },
      where: { id: input.itemId },
    }),
    database.user.findUnique({ select: { id: true }, where: { email: input.reviewerEmail } }),
  ]);

  if (item === null) {
    return undefined;
  }

  if (!canTransitionMarketplaceStatus({ from: item.status, to: input.status })) {
    throw new MarketplaceStateError('当前状态不允许执行这项人工审核操作。');
  }

  const now = new Date();
  const published = input.status === 'PUBLISHED';
  const result = await database.marketplaceItem.update({
    data: {
      enabled: input.status === 'ARCHIVED' ? false : true,
      publishedAt: published ? now : null,
      reviewedAt: now,
      reviewedByUserId: reviewer?.id ?? null,
      reviewReason: input.reason === undefined || input.reason === '' ? null : input.reason,
      status: input.status,
    },
    select: { id: true, slug: true, status: true, title: true },
    where: { id: item.id },
  });

  if (item.type === 'PLUGIN') {
    await database.marketplacePlugin.updateMany({
      data: { enabled: published },
      where: { itemId: item.id },
    });
  }

  return result;
}

function normalizePage(value: number | undefined): number {
  return value === undefined || !Number.isFinite(value) ? 1 : Math.max(1, Math.trunc(value));
}
