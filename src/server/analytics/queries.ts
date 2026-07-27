import { blogPosts } from '@/content/blog/posts';
import { projects } from '@/data/projects';
import { services } from '@/data/services';
import { getLocaleFromPathname } from '@/i18n/config';
import { getCmsDatabase } from '@/server/cms/database';

const analyticsTimeZone = 'Asia/Shanghai';
const maximumAnalyticsEventsPerDashboardQuery = 10_000;

export const analyticsRangeValues = ['today', '7d', '30d'] as const;

export type AnalyticsRange = (typeof analyticsRangeValues)[number];

type AnalyticsRecord = Readonly<{
  readonly createdAt: Date;
  readonly event: string;
  readonly metadata: unknown;
  readonly path: string;
}>;

export type AnalyticsRanking = Readonly<{
  readonly detail: string;
  readonly key: string;
  readonly label: string;
  readonly value: number;
}>;

export type AnalyticsTrendPoint = Readonly<{
  readonly date: string;
  readonly label: string;
  readonly pageViews: number;
}>;

export type AnalyticsFunnelStep = Readonly<{
  readonly label: string;
  readonly value: number;
}>;

export type AdminAnalyticsData = Readonly<{
  readonly articleRankings: readonly AnalyticsRanking[];
  readonly assistantCategories: readonly AnalyticsRanking[];
  readonly contactSources: readonly AnalyticsRanking[];
  readonly funnel: readonly AnalyticsFunnelStep[];
  readonly languageRankings: readonly AnalyticsRanking[];
  readonly metrics: Readonly<{
    readonly articleReads: number;
    readonly assistantUses: number;
    readonly contactClicks: number;
    readonly contactSubmissions: number;
    readonly pageViews: number;
    readonly projectViews: number;
    readonly serviceViews: number;
  }>;
  readonly projectRankings: readonly AnalyticsRanking[];
  readonly range: AnalyticsRange;
  readonly trend: readonly AnalyticsTrendPoint[];
  readonly visits: Readonly<{
    readonly month: number;
    readonly today: number;
    readonly week: number;
  }>;
  readonly pageRankings: readonly AnalyticsRanking[];
  readonly serviceRankings: readonly AnalyticsRanking[];
}>;

export function parseAnalyticsRange(value: string | string[] | undefined): AnalyticsRange {
  return typeof value === 'string' && isAnalyticsRange(value) ? value : '7d';
}

export async function getAdminAnalyticsData(
  range: AnalyticsRange,
): Promise<AdminAnalyticsData | undefined> {
  const database = getCmsDatabase();

  if (database === undefined) {
    return undefined;
  }

  const now = new Date();
  const monthStart = getRangeStart('30d', now);
  const [events, cmsProjects, cmsPosts, cmsServices] = await Promise.all([
    database.analyticsEvent.findMany({
      orderBy: { createdAt: 'asc' },
      select: { createdAt: true, event: true, metadata: true, path: true },
      take: maximumAnalyticsEventsPerDashboardQuery,
      where: { createdAt: { gte: monthStart } },
    }),
    database.project.findMany({ select: { slug: true, title: true } }),
    database.post.findMany({ select: { slug: true, title: true } }),
    database.service.findMany({ select: { slug: true, title: true } }),
  ]);

  const records: readonly AnalyticsRecord[] = events;
  const visibleEvents = records.filter((event) => event.createdAt >= getRangeStart(range, now));
  const contentLabels = createContentLabels(cmsProjects, cmsPosts, cmsServices);
  const homeVisits = countHomeVisits(visibleEvents);
  const projectViews = countEvents(visibleEvents, 'view_project');
  const serviceViews = countEvents(visibleEvents, 'view_service');
  const contactClicks = countEvents(visibleEvents, 'click_contact');
  const contactSubmissions = countEvents(visibleEvents, 'submit_contact');

  return {
    articleRankings: createArticleRankings(visibleEvents, contentLabels.blog),
    assistantCategories: createMetadataRankings(
      visibleEvents,
      'use_ai_assistant',
      'category',
      new Map([
        ['project', '项目咨询'],
        ['service', '服务了解'],
        ['technology', '技术问题'],
        ['cooperation', '合作方式'],
        ['general', '其他站内咨询'],
      ]),
      '次使用',
    ),
    contactSources: createMetadataRankings(
      visibleEvents,
      'click_contact',
      'source',
      new Map([
        ['hero', 'Hero 首屏'],
        ['services', '服务区'],
        ['footer', '页脚'],
        ['ai', 'AI Assistant'],
        ['projects', '项目区'],
        ['navigation', '导航栏'],
        ['contact_cta', '联系 CTA'],
        ['direct', '直接访问'],
      ]),
      '次点击',
    ),
    funnel: [
      { label: '访问首页', value: homeVisits },
      { label: '查看项目', value: projectViews },
      { label: '查看服务', value: serviceViews },
      { label: '打开联系', value: contactClicks },
      { label: '提交表单', value: contactSubmissions },
    ],
    languageRankings: createLanguageRankings(visibleEvents),
    metrics: {
      articleReads: countEvents(visibleEvents, 'read_article'),
      assistantUses: countEvents(visibleEvents, 'use_ai_assistant'),
      contactClicks,
      contactSubmissions,
      pageViews: countEvents(visibleEvents, 'page_view'),
      projectViews,
      serviceViews,
    },
    pageRankings: createPageRankings(visibleEvents),
    projectRankings: createProjectRankings(visibleEvents, contentLabels.project),
    range,
    serviceRankings: createMetadataRankings(
      visibleEvents,
      'view_service',
      'service',
      contentLabels.service,
      '次查看',
    ),
    trend: createTrend(visibleEvents, range, now),
    visits: {
      month: countEvents(
        records.filter((event) => event.createdAt >= monthStart),
        'page_view',
      ),
      today: countEvents(
        records.filter((event) => event.createdAt >= getRangeStart('today', now)),
        'page_view',
      ),
      week: countEvents(
        records.filter((event) => event.createdAt >= getRangeStart('7d', now)),
        'page_view',
      ),
    },
  };
}

function createContentLabels(
  cmsProjects: readonly Readonly<{ readonly slug: string; readonly title: string }>[],
  cmsPosts: readonly Readonly<{ readonly slug: string; readonly title: string }>[],
  cmsServices: readonly Readonly<{ readonly slug: string; readonly title: string }>[],
): Readonly<{
  readonly blog: ReadonlyMap<string, string>;
  readonly project: ReadonlyMap<string, string>;
  readonly service: ReadonlyMap<string, string>;
}> {
  const projectLabels = new Map<string, string>(
    projects.map((project) => [project.slug, project.title]),
  );
  const blogLabels = new Map<string, string>(blogPosts.map((post) => [post.slug, post.title]));
  const serviceLabels = new Map<string, string>(
    services.map((service) => [service.slug, service.title]),
  );

  for (const project of cmsProjects) {
    projectLabels.set(project.slug, project.title);
  }

  for (const post of cmsPosts) {
    blogLabels.set(post.slug, post.title);
  }

  for (const service of cmsServices) {
    serviceLabels.set(service.slug, service.title);
  }

  return { blog: blogLabels, project: projectLabels, service: serviceLabels };
}

function createTrend(
  events: readonly AnalyticsRecord[],
  range: AnalyticsRange,
  now: Date,
): readonly AnalyticsTrendPoint[] {
  const dayCount = range === 'today' ? 1 : range === '7d' ? 7 : 30;
  const counts = new Map<string, number>();

  for (const event of events) {
    if (event.event !== 'page_view') {
      continue;
    }

    const key = getShanghaiDateKey(event.createdAt);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  return Array.from({ length: dayCount }, (_, index) => {
    const date = new Date(now.getTime() - (dayCount - index - 1) * 86_400_000);
    const key = getShanghaiDateKey(date);

    return {
      date: key,
      label: new Intl.DateTimeFormat('zh-CN', {
        day: 'numeric',
        month: 'numeric',
        timeZone: analyticsTimeZone,
      }).format(date),
      pageViews: counts.get(key) ?? 0,
    };
  });
}

function createPageRankings(events: readonly AnalyticsRecord[]): readonly AnalyticsRanking[] {
  const counts = new Map<string, number>();

  for (const event of events) {
    if (event.event === 'page_view') {
      counts.set(event.path, (counts.get(event.path) ?? 0) + 1);
    }
  }

  return sortCounts(counts).map(([path, value]) => ({
    detail: `${value} 次访问`,
    key: path,
    label: path === '/' ? '首页' : path,
    value,
  }));
}

function createLanguageRankings(events: readonly AnalyticsRecord[]): readonly AnalyticsRanking[] {
  const counts = new Map<string, number>();

  for (const event of events) {
    if (event.event !== 'page_view') {
      continue;
    }

    const language =
      readMetadataString(event.metadata, 'language') ?? getLocaleFromPathname(event.path);
    counts.set(language, (counts.get(language) ?? 0) + 1);
  }

  const labels = new Map([
    ['zh-CN', '中文站'],
    ['en-US', 'English site'],
  ]);

  return sortCounts(counts).map(([language, value]) => ({
    detail: `${value} 次访问`,
    key: language,
    label: labels.get(language) ?? language,
    value,
  }));
}

function createProjectRankings(
  events: readonly AnalyticsRecord[],
  labels: ReadonlyMap<string, string>,
): readonly AnalyticsRanking[] {
  const views = countMetadataValues(events, 'view_project', 'project');
  const githubClicks = countProjectActions(events, 'github');
  const contactClicks = countProjectActions(events, 'contact');

  return sortCounts(views).map(([project, value]) => ({
    detail: `${value} 次浏览 · GitHub ${githubClicks.get(project) ?? 0} · 联系 ${contactClicks.get(project) ?? 0}`,
    key: project,
    label: labels.get(project) ?? project,
    value,
  }));
}

function createArticleRankings(
  events: readonly AnalyticsRecord[],
  labels: ReadonlyMap<string, string>,
): readonly AnalyticsRanking[] {
  const reads = countMetadataValues(events, 'read_article', 'slug');
  const engagement = new Map<
    string,
    { completed: number; durationSeconds: number; total: number }
  >();

  for (const event of events) {
    if (event.event !== 'article_engagement') {
      continue;
    }

    const slug = readMetadataString(event.metadata, 'slug');
    const durationSeconds = readMetadataNumber(event.metadata, 'durationSeconds');
    const completed = readMetadataBoolean(event.metadata, 'completed');

    if (slug === undefined || durationSeconds === undefined || completed === undefined) {
      continue;
    }

    const current = engagement.get(slug) ?? { completed: 0, durationSeconds: 0, total: 0 };
    current.completed += completed ? 1 : 0;
    current.durationSeconds += durationSeconds;
    current.total += 1;
    engagement.set(slug, current);
  }

  return sortCounts(reads).map(([slug, value]) => {
    const stats = engagement.get(slug);
    const averageDuration =
      stats === undefined || stats.total === 0
        ? undefined
        : Math.round(stats.durationSeconds / stats.total);
    const completionRate =
      stats === undefined || stats.total === 0
        ? undefined
        : Math.round((stats.completed / stats.total) * 100);

    return {
      detail:
        averageDuration === undefined || completionRate === undefined
          ? `${value} 次阅读 · 暂无停留数据`
          : `${value} 次阅读 · 平均 ${formatDuration(averageDuration)} · 完读 ${completionRate}%`,
      key: slug,
      label: labels.get(slug) ?? slug,
      value,
    };
  });
}

function createMetadataRankings(
  events: readonly AnalyticsRecord[],
  eventName: string,
  metadataKey: string,
  labels: ReadonlyMap<string, string>,
  suffix: string,
): readonly AnalyticsRanking[] {
  const counts = countMetadataValues(events, eventName, metadataKey);

  return sortCounts(counts).map(([key, value]) => ({
    detail: `${value} ${suffix}`,
    key,
    label: labels.get(key) ?? key,
    value,
  }));
}

function countProjectActions(
  events: readonly AnalyticsRecord[],
  action: string,
): ReadonlyMap<string, number> {
  const counts = new Map<string, number>();

  for (const event of events) {
    if (
      event.event !== 'project_action' ||
      readMetadataString(event.metadata, 'action') !== action
    ) {
      continue;
    }

    const project = readMetadataString(event.metadata, 'project');

    if (project !== undefined) {
      counts.set(project, (counts.get(project) ?? 0) + 1);
    }
  }

  return counts;
}

function countMetadataValues(
  events: readonly AnalyticsRecord[],
  eventName: string,
  metadataKey: string,
): ReadonlyMap<string, number> {
  const counts = new Map<string, number>();

  for (const event of events) {
    if (event.event !== eventName) {
      continue;
    }

    const value = readMetadataString(event.metadata, metadataKey);

    if (value !== undefined) {
      counts.set(value, (counts.get(value) ?? 0) + 1);
    }
  }

  return counts;
}

function countEvents(events: readonly AnalyticsRecord[], eventName: string, path?: string): number {
  return events.filter(
    (event) => event.event === eventName && (path === undefined || event.path === path),
  ).length;
}

function countHomeVisits(events: readonly AnalyticsRecord[]): number {
  return events.filter(
    (event) => event.event === 'page_view' && (event.path === '/' || event.path === '/en'),
  ).length;
}

function sortCounts(counts: ReadonlyMap<string, number>): readonly [string, number][] {
  return [...counts.entries()]
    .sort(([firstKey, firstValue], [secondKey, secondValue]) => {
      if (firstValue !== secondValue) {
        return secondValue - firstValue;
      }

      return firstKey.localeCompare(secondKey, 'zh-CN');
    })
    .slice(0, 5);
}

function getRangeStart(range: AnalyticsRange, now: Date): Date {
  const dayOffset = range === 'today' ? 0 : range === '7d' ? 6 : 29;
  const targetDate = new Date(now.getTime() - dayOffset * 86_400_000);
  const parts = getShanghaiDateParts(targetDate);

  return new Date(Date.UTC(parts.year, parts.month - 1, parts.day) - 8 * 3_600_000);
}

function getShanghaiDateKey(date: Date): string {
  const parts = getShanghaiDateParts(date);

  return `${parts.year}-${String(parts.month).padStart(2, '0')}-${String(parts.day).padStart(2, '0')}`;
}

function getShanghaiDateParts(
  date: Date,
): Readonly<{ readonly day: number; readonly month: number; readonly year: number }> {
  const parts = new Intl.DateTimeFormat('en-US', {
    day: '2-digit',
    month: '2-digit',
    timeZone: analyticsTimeZone,
    year: 'numeric',
  }).formatToParts(date);

  const day = getDatePart(parts, 'day');
  const month = getDatePart(parts, 'month');
  const year = getDatePart(parts, 'year');

  return { day, month, year };
}

function getDatePart(
  parts: readonly Intl.DateTimeFormatPart[],
  type: Intl.DateTimeFormatPartTypes,
): number {
  const value = parts.find((part) => part.type === type)?.value;
  const parsedValue = value === undefined ? Number.NaN : Number(value);

  return Number.isFinite(parsedValue) ? parsedValue : 1;
}

function readMetadataString(metadata: unknown, key: string): string | undefined {
  if (!isRecord(metadata)) {
    return undefined;
  }

  const value = metadata[key];

  return typeof value === 'string' ? value : undefined;
}

function readMetadataNumber(metadata: unknown, key: string): number | undefined {
  if (!isRecord(metadata)) {
    return undefined;
  }

  const value = metadata[key];

  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

function readMetadataBoolean(metadata: unknown, key: string): boolean | undefined {
  if (!isRecord(metadata)) {
    return undefined;
  }

  const value = metadata[key];

  return typeof value === 'boolean' ? value : undefined;
}

function isRecord(value: unknown): value is Readonly<Record<string, unknown>> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function formatDuration(seconds: number): string {
  return seconds < 60 ? `${seconds} 秒` : `${Math.round(seconds / 60)} 分钟`;
}

function isAnalyticsRange(value: string): value is AnalyticsRange {
  return analyticsRangeValues.some((range) => range === value);
}
