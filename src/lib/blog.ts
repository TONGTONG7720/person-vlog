import { readFile } from 'node:fs/promises';
import { basename, resolve } from 'node:path';

import { blogPosts } from '@/content/blog/posts';
import type { BlogPost } from '@/types/blog';

const staticBlogContentDirectory = resolve(process.cwd(), 'src', 'content', 'blog');
const markdownImagePattern = /!\[([^\]]*)\]\(([^)]+)\)/gu;
const markdownHeadingPattern = /^#{1,3}\s+.+$/mu;

export type ContentQualityIssue = Readonly<{
  readonly code:
    | 'missing-description'
    | 'missing-heading'
    | 'missing-image-alt'
    | 'missing-image-filename'
    | 'missing-keywords'
    | 'missing-seo';
  readonly message: string;
}>;

export type ContentQualityInput = Readonly<{
  readonly content: string;
  readonly description: string;
  readonly keywords: readonly string[];
  readonly relatedProjects: readonly string[];
  readonly relatedServices: readonly string[];
  readonly seoDescription: string;
  readonly seoTitle: string;
  readonly title: string;
}>;

export type RelatedBlogPostOptions = Readonly<{
  readonly currentPost: BlogPost;
  readonly limit?: number;
  readonly posts: readonly BlogPost[];
}>;

export function getPublishedBlogPosts(): readonly BlogPost[] {
  return blogPosts.filter((post) => !post.draft && post.status === 'published');
}

export function getFeaturedBlogPosts(): readonly BlogPost[] {
  return getPublishedBlogPosts().filter((post) => post.featured);
}

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return getPublishedBlogPosts().find((post) => post.slug === slug);
}

export function getRelatedBlogPosts({
  currentPost,
  limit = 3,
  posts,
}: RelatedBlogPostOptions): readonly BlogPost[] {
  const currentTags = new Set(currentPost.tags.map((tag) => tag.toLocaleLowerCase('zh-CN')));
  const currentProjects = new Set(currentPost.relatedProjects);
  const currentServices = new Set(currentPost.relatedServices);
  const explicitRelatedPosts = new Set(currentPost.relatedPosts);

  return posts
    .flatMap((candidate) => {
      if (candidate.slug === currentPost.slug) {
        return [];
      }

      const sharedTags = candidate.tags.filter((tag) =>
        currentTags.has(tag.toLocaleLowerCase('zh-CN')),
      ).length;
      const sharedProjects = candidate.relatedProjects.filter((project) =>
        currentProjects.has(project),
      ).length;
      const sharedServices = candidate.relatedServices.filter((service) =>
        currentServices.has(service),
      ).length;
      const score =
        (candidate.category === currentPost.category ? 4 : 0) +
        sharedTags * 2 +
        sharedProjects * 6 +
        sharedServices * 4 +
        (explicitRelatedPosts.has(candidate.slug) ? 10 : 0);

      return score === 0 ? [] : [{ post: candidate, score }];
    })
    .toSorted((first, second) => {
      if (first.score !== second.score) {
        return second.score - first.score;
      }

      return second.post.publishedAt.localeCompare(first.post.publishedAt, 'zh-CN');
    })
    .slice(0, limit)
    .map(({ post }) => post);
}

export function getContentQualityIssues(
  input: ContentQualityInput,
): readonly ContentQualityIssue[] {
  const issues: ContentQualityIssue[] = [];

  if (input.description.trim().length < 10) {
    issues.push({ code: 'missing-description', message: '请补充至少一句清晰的文章摘要。' });
  }

  if (input.seoTitle.trim() === '' || input.seoDescription.trim() === '') {
    issues.push({ code: 'missing-seo', message: '请补充 SEO 标题和 SEO 描述。' });
  }

  if (input.keywords.length === 0) {
    issues.push({ code: 'missing-keywords', message: '请补充与搜索意图一致的关键词。' });
  }

  if (!markdownHeadingPattern.test(input.content)) {
    issues.push({ code: 'missing-heading', message: '正文至少应有一个 Markdown 标题层级。' });
  }

  for (const match of input.content.matchAll(markdownImagePattern)) {
    const alt = match[1]?.trim() ?? '';
    const source = match[2]?.trim() ?? '';

    if (alt === '') {
      issues.push({ code: 'missing-image-alt', message: '文章图片需要准确的替代文本。' });
    }

    if (source !== '' && !hasDescriptiveImageFilename(source)) {
      issues.push({
        code: 'missing-image-filename',
        message: '文章图片请使用描述性的英文连字符文件名。',
      });
    }
  }

  return issues;
}

export async function getBlogPostContent(post: BlogPost): Promise<string> {
  if (post.content !== undefined && post.content.trim() !== '') {
    return stripFrontmatter(post.content);
  }

  if (post.contentPath === undefined) {
    return '';
  }

  const filename = basename(post.contentPath);

  if (filename === '' || filename !== post.contentPath.split('/').at(-1)) {
    return '';
  }

  const contentPath = resolve(staticBlogContentDirectory, filename);

  try {
    return stripFrontmatter(await readFile(contentPath, 'utf8'));
  } catch (error) {
    if (error instanceof Error) {
      return '';
    }

    throw error;
  }
}

function hasDescriptiveImageFilename(source: string): boolean {
  const filename = source.split('/').pop()?.split('?')[0] ?? '';

  return /^[a-z0-9]+(?:-[a-z0-9]+)*\.(?:avif|gif|jpe?g|png|webp)$/iu.test(filename);
}

function stripFrontmatter(content: string): string {
  if (!content.startsWith('---')) {
    return content.trim();
  }

  const frontmatterEnd = content.indexOf('\n---', 3);

  return frontmatterEnd === -1 ? content.trim() : content.slice(frontmatterEnd + 4).trim();
}
