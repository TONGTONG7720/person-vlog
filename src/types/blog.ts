import {
  contentCategoryIds,
  type ContentCategory,
  type SocialContentChannel,
} from '@/config/content';

export const blogCategories = contentCategoryIds;

export type BlogCategory = ContentCategory;

export const blogPostStatuses = ['draft', 'published'] as const;

export type BlogPostStatus = (typeof blogPostStatuses)[number];

export type BlogSocialContent = Readonly<Partial<Record<SocialContentChannel, string>>>;

export const blogCoverVariants = [
  'enterprise-system',
  'rag-system',
  'architecture-system',
] as const;

export type BlogCoverVariant = (typeof blogCoverVariants)[number];

export type BlogPost = Readonly<{
  readonly author: string;
  readonly category: BlogCategory;
  readonly canonical?: string;
  readonly content?: string;
  readonly contentPath?: string;
  readonly coverImage?: string;
  readonly coverVariant: BlogCoverVariant;
  readonly description: string;
  readonly draft: boolean;
  readonly featured: boolean;
  readonly isPrimary: boolean;
  readonly keywords: readonly string[];
  readonly ogImage?: string;
  readonly publishedAt: string;
  readonly readingTime: number;
  readonly relatedPosts: readonly string[];
  readonly relatedProjects: readonly string[];
  readonly relatedServices: readonly string[];
  readonly seoDescription?: string;
  readonly seoTitle?: string;
  readonly slug: string;
  readonly socialContent?: BlogSocialContent;
  readonly status: BlogPostStatus;
  readonly tags: readonly string[];
  readonly title: string;
  readonly updatedAt?: string;
}>;

export type BlogSectionContent = Readonly<{
  readonly closing: Readonly<{
    readonly actionLabel: string;
    readonly statement: string;
  }>;
  readonly description: string;
  readonly eyebrow: string;
  readonly intro: Readonly<{
    readonly description: string;
    readonly title: string;
  }>;
  readonly number: string;
  readonly title: string;
}>;
