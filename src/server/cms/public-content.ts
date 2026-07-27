import type {
  Post as CmsPost,
  Project as CmsProject,
  Service as CmsService,
} from '@/generated/prisma/client';
import { ProjectStatus as CmsProjectStatus } from '@/generated/prisma/client';
import { normalizeContentCategory } from '@/config/content';
import { getLocalizedBlogPostBySlug, getLocalizedBlogPosts } from '@/content/blog/posts';
import { getLocalizedProjectBySlug, getLocalizedProjects } from '@/data/projects';
import { getLocalizedServices } from '@/data/services';
import { defaultLocale } from '@/i18n/config';
import { getCmsDatabase } from '@/server/cms/database';
import type { Locale } from '@/types/i18n';
import { blogCoverVariants, type BlogPost } from '@/types/blog';
import {
  projectAccents,
  projectCategories,
  projectPreviewTypes,
  type Project,
  type ProjectCategory,
  type ProjectStatus,
} from '@/types/project';
import {
  serviceAccents,
  serviceCategories,
  type Service,
  type ServiceCategory,
} from '@/types/service';

const defaultProjectCategory: ProjectCategory = 'full-stack';
const defaultServiceCategory: ServiceCategory = 'consulting';

export async function getPublicProjects(
  locale: Locale = defaultLocale,
): Promise<readonly Project[]> {
  const database = getCmsDatabase();
  const fallbackProjects = getLocalizedProjects(locale);

  if (database === undefined) {
    return fallbackProjects;
  }

  try {
    const entries = await database.project.findMany({
      orderBy: { updatedAt: 'desc' },
      where: { locale },
    });

    return entries.length === 0
      ? fallbackProjects
      : entries.map((entry, index) => mapCmsProject(entry, index, locale));
  } catch {
    return fallbackProjects;
  }
}

export async function getPublicProjectBySlug(
  slug: string,
  locale: Locale = defaultLocale,
): Promise<Project | undefined> {
  const database = getCmsDatabase();

  if (database !== undefined) {
    try {
      const entry = await database.project.findUnique({ where: { locale_slug: { locale, slug } } });

      if (entry !== null) {
        return mapCmsProject(entry, 0, locale);
      }
    } catch {
      return getLocalizedProjectBySlug(slug, locale);
    }
  }

  return getLocalizedProjectBySlug(slug, locale);
}

export async function getPublicBlogPosts(
  locale: Locale = defaultLocale,
): Promise<readonly BlogPost[]> {
  const database = getCmsDatabase();
  const fallbackPosts = getLocalizedBlogPosts(locale).filter(
    (post) => !post.draft && post.status === 'published',
  );

  if (database === undefined) {
    return fallbackPosts;
  }

  try {
    const entries = await database.post.findMany({
      orderBy: [{ publishedAt: 'desc' }, { updatedAt: 'desc' }],
      where: { locale, published: true },
    });

    return entries.length === 0
      ? fallbackPosts
      : entries.map((entry, index) => mapCmsPost(entry, index, locale));
  } catch {
    return fallbackPosts;
  }
}

export async function getPublicBlogPostBySlug(
  slug: string,
  locale: Locale = defaultLocale,
): Promise<BlogPost | undefined> {
  const database = getCmsDatabase();

  if (database !== undefined) {
    try {
      const entry = await database.post.findFirst({ where: { locale, published: true, slug } });

      if (entry !== null) {
        return mapCmsPost(entry, 0, locale);
      }
    } catch {
      return getLocalizedBlogPostBySlug(slug, locale);
    }
  }

  return getLocalizedBlogPostBySlug(slug, locale);
}

export async function getPublicServices(
  locale: Locale = defaultLocale,
): Promise<readonly Service[]> {
  const database = getCmsDatabase();
  const fallbackServices = getLocalizedServices(locale);

  if (database === undefined) {
    return fallbackServices;
  }

  try {
    const entries = await database.service.findMany({
      orderBy: { updatedAt: 'desc' },
      where: { locale },
    });

    return entries.length === 0
      ? fallbackServices
      : entries.map((entry, index) => mapCmsService(entry, index, locale));
  } catch {
    return fallbackServices;
  }
}

export async function getPublicFeaturedProjects(
  locale: Locale = defaultLocale,
): Promise<readonly Project[]> {
  const entries = await getPublicProjects(locale);
  const featuredEntries = entries.filter((entry) => entry.featured);

  return featuredEntries.length === 0 ? entries.slice(0, 4) : featuredEntries;
}

export async function getPublicFeaturedPosts(
  locale: Locale = defaultLocale,
): Promise<readonly BlogPost[]> {
  return (await getPublicBlogPosts(locale)).slice(0, 3);
}

export async function getPublicFeaturedServices(
  locale: Locale = defaultLocale,
): Promise<readonly Service[]> {
  const entries = await getPublicServices(locale);
  const featuredEntries = entries.filter((entry) => entry.featured);

  return featuredEntries.length === 0 ? entries : featuredEntries;
}

function mapCmsProject(entry: CmsProject, index = 0, locale: Locale = defaultLocale): Project {
  const categories = getProjectCategories(entry.categories);

  return {
    accent: selectFromList(projectAccents, index, 'violet'),
    category: categories,
    challenge:
      entry.content ??
      (locale === 'en-US'
        ? 'The case-study background and user pain points will be expanded as the project evolves.'
        : '项目背景与用户痛点会在案例内容中持续补充。'),
    description: entry.description,
    featured: entry.featured,
    featuredOrder: index + 1,
    ...(entry.coverImage === null ? {} : { coverImage: entry.coverImage }),
    ...(entry.content === null ? {} : { longDescription: entry.content }),
    previewType: selectFromList(projectPreviewTypes, index, 'store-dashboard'),
    projectType: 'personal',
    slug: entry.slug,
    solution:
      entry.content ??
      (locale === 'en-US'
        ? 'The delivery is shaped around business goals, a clear technical implementation and a maintainable handover.'
        : '围绕实际业务目标完成需求梳理、技术实现与可维护的交付。'),
    status: mapProjectStatus(entry.status),
    technologies: entry.technologies,
    title: entry.title,
    year: entry.updatedAt.getFullYear(),
  };
}

function mapCmsPost(entry: CmsPost, index = 0, locale: Locale = defaultLocale): BlogPost {
  const publishedAt = (entry.publishedAt ?? entry.createdAt).toISOString().slice(0, 10);
  const socialContent = getCmsSocialContent(entry.socialContent);

  return {
    author: locale === 'en-US' ? 'Tong' : '瞳瞳',
    category: normalizeContentCategory(entry.category),
    ...(entry.canonical === null ? {} : { canonical: entry.canonical }),
    content: entry.content,
    ...(entry.coverImage === null ? {} : { coverImage: entry.coverImage }),
    coverVariant: selectFromList(blogCoverVariants, index, 'enterprise-system'),
    description: entry.description,
    draft: !entry.published,
    featured: index < 3,
    isPrimary: index === 0,
    keywords: entry.keywords.length === 0 ? entry.tags : entry.keywords,
    ...(entry.ogImage === null ? {} : { ogImage: entry.ogImage }),
    publishedAt,
    readingTime: estimateReadingTime(entry.content),
    relatedPosts: entry.relatedPosts,
    relatedProjects: entry.relatedProjects,
    relatedServices: entry.relatedServices,
    ...(entry.seoDescription === null ? {} : { seoDescription: entry.seoDescription }),
    ...(entry.seoTitle === null ? {} : { seoTitle: entry.seoTitle }),
    slug: entry.slug,
    ...(socialContent === undefined ? {} : { socialContent }),
    status: entry.published ? 'published' : 'draft',
    tags: entry.tags,
    title: entry.title,
    updatedAt: entry.updatedAt.toISOString().slice(0, 10),
  };
}

function mapCmsService(entry: CmsService, index = 0, locale: Locale = defaultLocale): Service {
  const category = isServiceCategory(entry.category) ? entry.category : defaultServiceCategory;
  const description = entry.content ?? entry.description;

  return {
    accent: selectFromList(serviceAccents, index, 'blue'),
    action: {
      href: `/contact?service=${encodeURIComponent(entry.slug)}`,
      label: locale === 'en-US' ? 'Discuss this service' : '咨询这个服务',
    },
    category,
    deliverables:
      locale === 'en-US'
        ? ['Requirements discovery', 'Solution design', 'Implementation', 'Testing and handover']
        : ['需求沟通', '方案设计', '开发实现', '测试交付'],
    description,
    eyebrow: entry.category.toLocaleUpperCase('en-US'),
    featured: entry.featured,
    featuredOrder: index + 1,
    id: entry.slug,
    number: String(index + 1).padStart(2, '0'),
    problems:
      locale === 'en-US'
        ? [
            'The requirements or workflow are not clear yet',
            'An existing system needs a critical capability',
          ]
        : ['需求或流程尚未梳理清楚', '现有系统需要补齐关键能力'],
    shortDescription: entry.description,
    slug: entry.slug,
    suitableFor:
      locale === 'en-US'
        ? [
            'Teams that need a clear delivery boundary and plan',
            'Clients turning a business idea into a usable product',
          ]
        : ['需要明确开发边界和交付方案的团队', '希望将业务想法转化为可用产品的客户'],
    technologies:
      locale === 'en-US'
        ? ['Defined from the business context, existing system and delivery goal']
        : ['根据业务场景、现有系统与交付目标确定'],
    title: entry.title,
  };
}

function getProjectCategories(values: readonly string[]): Project['category'] {
  const validCategories = values.filter(isProjectCategory);
  const firstCategory = validCategories[0];

  return firstCategory === undefined
    ? [defaultProjectCategory]
    : [firstCategory, ...validCategories.slice(1)];
}

function mapProjectStatus(status: CmsProjectStatus): ProjectStatus {
  if (status === CmsProjectStatus.COMPLETED) {
    return 'completed';
  }

  return status === CmsProjectStatus.IN_PROGRESS ? 'in-progress' : 'concept';
}

function estimateReadingTime(content: string): number {
  return Math.max(1, Math.ceil(content.replaceAll(/\s/gu, '').length / 450));
}

function selectFromList<Item>(items: readonly Item[], index: number, fallback: Item): Item {
  return items[index % items.length] ?? fallback;
}

function isProjectCategory(value: string): value is ProjectCategory {
  return projectCategories.some((category) => category === value);
}

function isServiceCategory(value: string): value is ServiceCategory {
  return serviceCategories.some((category) => category === value);
}

function getCmsSocialContent(
  value: CmsPost['socialContent'],
): BlogPost['socialContent'] | undefined {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    return undefined;
  }

  const entries = Object.entries(value).filter(
    (entry): entry is [keyof NonNullable<BlogPost['socialContent']>, string] =>
      (entry[0] === 'douyin' || entry[0] === 'wechat' || entry[0] === 'xiaohongshu') &&
      typeof entry[1] === 'string' &&
      entry[1].trim() !== '',
  );

  return entries.length === 0 ? undefined : Object.fromEntries(entries);
}
