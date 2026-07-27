import { getCmsDatabase } from '@/server/cms/database';

export type AdminContentPlanItem = Readonly<{
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
}>;

export type AdminKeywordItem = Readonly<{
  readonly category: string;
  readonly createdAt: Date;
  readonly difficulty: string | null;
  readonly id: string;
  readonly updatedAt: Date;
  readonly keyword: string;
  readonly volume: string | null;
}>;

export type AdminContentGrowthWorkspace = Readonly<{
  readonly keywords: readonly AdminKeywordItem[];
  readonly plans: readonly AdminContentPlanItem[];
}>;

export async function getAdminContentGrowthWorkspace(): Promise<
  AdminContentGrowthWorkspace | undefined
> {
  const database = getCmsDatabase();

  if (database === undefined) {
    return undefined;
  }

  const [plans, keywords] = await Promise.all([
    database.contentPlan.findMany({
      orderBy: [{ publishDate: 'asc' }, { updatedAt: 'desc' }],
      take: 60,
    }),
    database.keyword.findMany({
      orderBy: { updatedAt: 'desc' },
      take: 80,
    }),
  ]);

  return { keywords, plans };
}
