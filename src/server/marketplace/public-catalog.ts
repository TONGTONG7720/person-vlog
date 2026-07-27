import type { MarketplaceItemType, Prisma } from '@/generated/prisma/client';

import { getCmsDatabase } from '@/server/cms/database';

const marketplacePageSize = 12;

export type PublicMarketplaceItem = Readonly<{
  readonly category: string;
  readonly creator: Readonly<{
    readonly displayName: string;
    readonly verified: boolean;
  }>;
  readonly description: string;
  readonly favoriteCount: number;
  readonly id: string;
  readonly priceCents: number | null;
  readonly publishedAt: Date;
  readonly rating: number | null;
  readonly ratingCount: number;
  readonly slug: string;
  readonly tags: readonly string[];
  readonly title: string;
  readonly type: MarketplaceItemType;
  readonly usageCount: number;
}>;

export type PublicMarketplaceCatalog = Readonly<{
  readonly items: readonly PublicMarketplaceItem[];
  readonly page: number;
  readonly pageSize: number;
}>;

type PublicCatalogQuery = Readonly<{
  readonly category?: string;
  readonly page?: number;
  readonly search?: string;
  readonly type?: MarketplaceItemType;
}>;

export async function getPublicMarketplaceCatalog(
  query: PublicCatalogQuery = {},
): Promise<PublicMarketplaceCatalog> {
  const database = getCmsDatabase();
  const page = normalizePage(query.page);

  if (database === undefined) {
    return { items: [], page, pageSize: marketplacePageSize };
  }

  const items = await database.marketplaceItem.findMany({
    orderBy: [{ favoriteCount: 'desc' }, { usageCount: 'desc' }, { publishedAt: 'desc' }],
    select: publicMarketplaceItemSelection,
    skip: (page - 1) * marketplacePageSize,
    take: marketplacePageSize,
    where: buildPublicCatalogWhere(query),
  });

  return { items: items.map(toPublicMarketplaceItem), page, pageSize: marketplacePageSize };
}

export async function getPublicMarketplaceItemBySlug(
  slug: string,
): Promise<PublicMarketplaceItem | undefined> {
  const database = getCmsDatabase();

  if (database === undefined) {
    return undefined;
  }

  const item = await database.marketplaceItem.findFirst({
    select: publicMarketplaceItemSelection,
    where: { ...buildPublicCatalogWhere({}), slug },
  });

  return item === null ? undefined : toPublicMarketplaceItem(item);
}

function buildPublicCatalogWhere(query: PublicCatalogQuery): Prisma.MarketplaceItemWhereInput {
  const search = query.search?.trim();
  const category = query.category?.trim();

  return {
    ...(category === undefined || category === '' ? {} : { category }),
    ...(search === undefined || search === ''
      ? {}
      : {
          OR: [
            { creator: { displayName: { contains: search, mode: 'insensitive' } } },
            { description: { contains: search, mode: 'insensitive' } },
            { tags: { has: search } },
            { title: { contains: search, mode: 'insensitive' } },
          ],
        }),
    ...(query.type === undefined ? {} : { type: query.type }),
    enabled: true,
    publishedAt: { not: null },
    status: 'PUBLISHED',
  };
}

const publicMarketplaceItemSelection = {
  category: true,
  creator: { select: { displayName: true, verified: true } },
  description: true,
  favoriteCount: true,
  id: true,
  priceCents: true,
  publishedAt: true,
  ratingCount: true,
  ratingTotal: true,
  slug: true,
  tags: true,
  title: true,
  type: true,
  usageCount: true,
} as const;

function toPublicMarketplaceItem(
  item: Readonly<{
    readonly category: string;
    readonly creator: Readonly<{ readonly displayName: string; readonly verified: boolean }>;
    readonly description: string;
    readonly favoriteCount: number;
    readonly id: string;
    readonly priceCents: number | null;
    readonly publishedAt: Date | null;
    readonly ratingCount: number;
    readonly ratingTotal: number;
    readonly slug: string;
    readonly tags: readonly string[];
    readonly title: string;
    readonly type: MarketplaceItemType;
    readonly usageCount: number;
  }>,
): PublicMarketplaceItem {
  if (item.publishedAt === null) {
    throw new Error('Published marketplace item must have a publication date.');
  }

  return {
    category: item.category,
    creator: item.creator,
    description: item.description,
    favoriteCount: item.favoriteCount,
    id: item.id,
    priceCents: item.priceCents,
    publishedAt: item.publishedAt,
    rating: item.ratingCount === 0 ? null : item.ratingTotal / item.ratingCount,
    ratingCount: item.ratingCount,
    slug: item.slug,
    tags: item.tags,
    title: item.title,
    type: item.type,
    usageCount: item.usageCount,
  };
}

function normalizePage(value: number | undefined): number {
  return value === undefined || !Number.isFinite(value) ? 1 : Math.max(1, Math.trunc(value));
}
