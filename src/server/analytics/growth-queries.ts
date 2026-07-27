import { contentCategoryLabels, normalizeContentCategory } from '@/config/content';
import { getCmsDatabase } from '@/server/cms/database';

const maximumContentGrowthEvents = 10_000;

export type ContentGrowthRanking = Readonly<{
  readonly detail: string;
  readonly key: string;
  readonly label: string;
  readonly value: number;
}>;

export type AdminContentGrowthData = Readonly<{
  readonly categoryRankings: readonly ContentGrowthRanking[];
  readonly conversionRankings: readonly ContentGrowthRanking[];
  readonly metrics: Readonly<{
    readonly contentConversions: number;
    readonly publishedContent: number;
    readonly totalReads: number;
  }>;
  readonly plans: readonly {
    readonly category: string;
    readonly createdAt: Date;
    readonly id: string;
    readonly keyword: string;
    readonly locale: string;
    readonly notes: string | null;
    readonly priority: string;
    readonly publishDate: Date | null;
    readonly status: string;
    readonly title: string;
    readonly updatedAt: Date;
  }[];
}>;

export async function getAdminContentGrowthData(): Promise<AdminContentGrowthData | undefined> {
  const database = getCmsDatabase();

  if (database === undefined) {
    return undefined;
  }

  const [events, posts, publishedContent, plans] = await Promise.all([
    database.analyticsEvent.findMany({
      orderBy: { createdAt: 'desc' },
      select: { event: true, metadata: true },
      take: maximumContentGrowthEvents,
    }),
    database.post.findMany({
      select: { category: true, slug: true, title: true },
      where: { published: true },
    }),
    database.post.count({ where: { published: true } }),
    database.contentPlan.findMany({
      orderBy: [{ publishDate: 'asc' }, { updatedAt: 'desc' }],
      take: 24,
    }),
  ]);
  const postsBySlug = new Map(posts.map((post) => [post.slug, post]));
  const categoryReads = new Map<string, number>();
  const conversions = new Map<string, ContentGrowthRanking>();
  let totalReads = 0;
  let contentConversions = 0;

  for (const event of events) {
    if (event.event === 'read_article') {
      const slug = getMetadataString(event.metadata, 'slug');

      if (slug === undefined) {
        continue;
      }

      totalReads += 1;
      const post = postsBySlug.get(slug);

      if (post === undefined) {
        continue;
      }

      const category = normalizeContentCategory(post.category);
      categoryReads.set(category, (categoryReads.get(category) ?? 0) + 1);
    }

    if (event.event === 'content_conversion') {
      const slug = getMetadataString(event.metadata, 'slug');
      const target = getMetadataString(event.metadata, 'target');
      const targetId = getMetadataString(event.metadata, 'targetId');

      if (
        slug === undefined ||
        (target !== 'project' && target !== 'service' && target !== 'contact')
      ) {
        continue;
      }

      contentConversions += 1;
      const post = postsBySlug.get(slug);
      const targetLabel =
        target === 'project' ? '项目' : target === 'service' ? '服务' : '联系合作';
      const key = `${slug}:${target}:${targetId ?? ''}`;
      const current = conversions.get(key);

      conversions.set(key, {
        detail:
          targetId === undefined || targetId === '' ? targetLabel : `${targetLabel} / ${targetId}`,
        key,
        label: `${post?.title ?? slug} → ${targetLabel}`,
        value: (current?.value ?? 0) + 1,
      });
    }
  }

  return {
    categoryRankings: Array.from(categoryReads.entries())
      .map(([category, value]) => ({
        detail: '文章阅读次数',
        key: category,
        label: contentCategoryLabels[normalizeContentCategory(category)],
        value,
      }))
      .toSorted(compareGrowthRankings)
      .slice(0, 6),
    conversionRankings: Array.from(conversions.values())
      .toSorted(compareGrowthRankings)
      .slice(0, 8),
    metrics: { contentConversions, publishedContent, totalReads },
    plans,
  };
}

function getMetadataString(value: unknown, key: string): string | undefined {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    return undefined;
  }

  const record = value as Record<string, unknown>;
  const item = record[key];

  return typeof item === 'string' && item !== '' ? item : undefined;
}

function compareGrowthRankings(first: ContentGrowthRanking, second: ContentGrowthRanking): number {
  return second.value - first.value || first.label.localeCompare(second.label, 'zh-CN');
}
