import { getCmsDatabase } from '@/server/cms/database';

const adminPageSize = 12;

export type AdminListQuery = Readonly<{
  readonly page: number;
  readonly search: string;
}>;

export type AdminDashboardData = Readonly<{
  readonly activity: readonly {
    readonly action: string;
    readonly createdAt: Date;
    readonly id: string;
    readonly resource: string;
    readonly summary: string;
  }[];
  readonly counts: Readonly<{
    readonly knowledge: number;
    readonly messages: number;
    readonly posts: number;
    readonly projects: number;
  }>;
}>;

type TranslationResource = '文章' | '服务' | '项目';

type TranslationRecord = Readonly<{
  readonly locale: string;
  readonly resource: TranslationResource;
  readonly slug: string;
  readonly title: string;
  readonly translationGroup: string | null;
}>;

export type AdminTranslationOverview = Readonly<{
  readonly groups: readonly Readonly<{
    readonly id: string;
    readonly records: readonly TranslationRecord[];
  }>[];
  readonly unassigned: readonly TranslationRecord[];
}>;

export function getAdminListQuery(
  searchValue: string | string[] | undefined,
  pageValue: string | string[] | undefined,
): AdminListQuery {
  const search = typeof searchValue === 'string' ? searchValue.trim().slice(0, 100) : '';
  const rawPage = typeof pageValue === 'string' ? Number(pageValue) : 1;
  const page = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1;

  return { page, search };
}

export async function getAdminDashboardData(): Promise<AdminDashboardData | undefined> {
  const database = getCmsDatabase();

  if (database === undefined) {
    return undefined;
  }

  const [projects, posts, messages, knowledge, activity] = await Promise.all([
    database.project.count(),
    database.post.count(),
    database.message.count(),
    database.knowledge.count(),
    database.adminActivity.findMany({
      orderBy: { createdAt: 'desc' },
      take: 8,
    }),
  ]);

  return {
    activity,
    counts: { knowledge, messages, posts, projects },
  };
}

export async function getAdminProjects(query: AdminListQuery) {
  const database = getCmsDatabase();

  if (database === undefined) {
    return [];
  }

  return database.project.findMany({
    ...(query.search === ''
      ? {}
      : {
          where: {
            OR: [
              { slug: { contains: query.search, mode: 'insensitive' } },
              { title: { contains: query.search, mode: 'insensitive' } },
            ],
          },
        }),
    orderBy: { updatedAt: 'desc' },
    skip: (query.page - 1) * adminPageSize,
    take: adminPageSize,
  });
}

export async function getAdminPosts(query: AdminListQuery) {
  const database = getCmsDatabase();

  if (database === undefined) {
    return [];
  }

  return database.post.findMany({
    ...(query.search === ''
      ? {}
      : {
          where: {
            OR: [
              { slug: { contains: query.search, mode: 'insensitive' } },
              { title: { contains: query.search, mode: 'insensitive' } },
            ],
          },
        }),
    orderBy: { updatedAt: 'desc' },
    skip: (query.page - 1) * adminPageSize,
    take: adminPageSize,
  });
}

export async function getAdminServices(query: AdminListQuery) {
  const database = getCmsDatabase();

  if (database === undefined) {
    return [];
  }

  return database.service.findMany({
    ...(query.search === ''
      ? {}
      : {
          where: {
            OR: [
              { slug: { contains: query.search, mode: 'insensitive' } },
              { title: { contains: query.search, mode: 'insensitive' } },
            ],
          },
        }),
    orderBy: { updatedAt: 'desc' },
    skip: (query.page - 1) * adminPageSize,
    take: adminPageSize,
  });
}

export async function getAdminMessages(query: AdminListQuery) {
  const database = getCmsDatabase();

  if (database === undefined) {
    return [];
  }

  return database.message.findMany({
    ...(query.search === ''
      ? {}
      : {
          where: {
            OR: [
              { email: { contains: query.search, mode: 'insensitive' } },
              { name: { contains: query.search, mode: 'insensitive' } },
            ],
          },
        }),
    orderBy: { createdAt: 'desc' },
    skip: (query.page - 1) * adminPageSize,
    take: adminPageSize,
  });
}

export async function getAdminKnowledge(query: AdminListQuery) {
  const database = getCmsDatabase();

  if (database === undefined) {
    return [];
  }

  return database.knowledge.findMany({
    ...(query.search === ''
      ? {}
      : {
          where: {
            OR: [
              { slug: { contains: query.search, mode: 'insensitive' } },
              { title: { contains: query.search, mode: 'insensitive' } },
            ],
          },
        }),
    orderBy: { updatedAt: 'desc' },
    skip: (query.page - 1) * adminPageSize,
    take: adminPageSize,
  });
}

export async function getAdminSettings() {
  const database = getCmsDatabase();

  return database === undefined ? [] : database.siteSetting.findMany({ orderBy: { key: 'asc' } });
}

export async function getAdminMediaAssets() {
  const database = getCmsDatabase();

  return database === undefined
    ? []
    : database.mediaAsset.findMany({ orderBy: { createdAt: 'desc' }, take: 48 });
}

export async function getAdminTranslationOverview(): Promise<AdminTranslationOverview | undefined> {
  const database = getCmsDatabase();

  if (database === undefined) {
    return undefined;
  }

  try {
    const [projects, posts, services] = await Promise.all([
      database.project.findMany({
        orderBy: { updatedAt: 'desc' },
        select: { locale: true, slug: true, title: true, translationGroup: true },
      }),
      database.post.findMany({
        orderBy: { updatedAt: 'desc' },
        select: { locale: true, slug: true, title: true, translationGroup: true },
      }),
      database.service.findMany({
        orderBy: { updatedAt: 'desc' },
        select: { locale: true, slug: true, title: true, translationGroup: true },
      }),
    ]);
    const records: TranslationRecord[] = [
      ...projects.map((item) => ({ ...item, resource: '项目' as const })),
      ...posts.map((item) => ({ ...item, resource: '文章' as const })),
      ...services.map((item) => ({ ...item, resource: '服务' as const })),
    ];
    const groups = new Map<string, TranslationRecord[]>();

    for (const record of records) {
      if (record.translationGroup === null) {
        continue;
      }

      const entries = groups.get(record.translationGroup) ?? [];
      entries.push(record);
      groups.set(record.translationGroup, entries);
    }

    return {
      groups: [...groups.entries()].map(([id, groupRecords]) => ({
        id,
        records: groupRecords,
      })),
      unassigned: records.filter((record) => record.translationGroup === null),
    };
  } catch {
    return undefined;
  }
}
