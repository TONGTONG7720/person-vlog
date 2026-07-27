import { notFound } from 'next/navigation';

import { ArticleEngagementTracker } from '@/components/analytics/article-engagement-tracker';
import { ArticleTableOfContents } from '@/components/content/article-table-of-contents';
import { CjkPhraseText } from '@/components/content/cjk-phrase-text';
import { MarkdownContent } from '@/components/content/markdown-content';
import { RelatedContent } from '@/components/content/related-content';
import { BlogMeta } from '@/components/sections/blog/blog-meta';
import { JsonLd } from '@/components/seo/json-ld';
import { Container } from '@/components/ui/container';
import { Heading } from '@/components/ui/heading';
import { Link } from '@/i18n/navigation';
import { getPublicPageCopy } from '@/i18n/page-copy';
import { getRequestLocale } from '@/i18n/server';
import { getBlogPostContent } from '@/lib/blog';
import { formatBlogDate } from '@/lib/blog-format';
import { getMarkdownHeadings } from '@/lib/markdown';
import { createMetadata } from '@/lib/metadata';
import { generateArticleSchema } from '@/lib/schema';
import { blogPosts } from '@/content/blog/posts';
import {
  getPublicBlogPostBySlug,
  getPublicBlogPosts,
  getPublicProjects,
  getPublicServices,
} from '@/server/cms/public-content';

type BlogDetailPageProps = Readonly<{
  params: Promise<{
    slug: string;
  }>;
}>;

export const dynamic = 'force-dynamic';

export function generateStaticParams(): { slug: string }[] {
  return blogPosts
    .filter((post) => !post.draft && post.status === 'published')
    .map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: BlogDetailPageProps) {
  const { slug } = await params;
  const locale = await getRequestLocale();
  const [post, copy] = await Promise.all([
    getPublicBlogPostBySlug(slug, locale),
    getPublicPageCopy(locale),
  ]);

  if (!post) {
    return createMetadata({
      locale,
      noIndex: true,
      path: `/blog/${slug}`,
      title: copy.blogDetail.notFound,
    });
  }

  const metadata = createMetadata({
    description: post.seoDescription ?? post.description,
    ...(post.ogImage === undefined && post.coverImage === undefined
      ? {}
      : { image: post.ogImage ?? post.coverImage }),
    keywords: [...post.keywords, ...post.tags],
    locale,
    path: post.canonical ?? `/blog/${post.slug}`,
    title: post.seoTitle ?? post.title,
  });

  return {
    ...metadata,
    authors: [{ name: post.author }],
    openGraph: {
      ...metadata.openGraph,
      authors: [post.author],
      modifiedTime: post.updatedAt ?? post.publishedAt,
      publishedTime: post.publishedAt,
      tags: [...post.tags],
      type: 'article',
    },
  };
}

export default async function BlogDetailPage({
  params,
}: BlogDetailPageProps): Promise<React.JSX.Element> {
  const { slug } = await params;
  const locale = await getRequestLocale();
  const [post, copy] = await Promise.all([
    getPublicBlogPostBySlug(slug, locale),
    getPublicPageCopy(locale),
  ]);

  if (!post) {
    notFound();
  }

  const [content, posts, projects, services] = await Promise.all([
    getBlogPostContent(post),
    getPublicBlogPosts(locale),
    getPublicProjects(locale),
    getPublicServices(locale),
  ]);
  const headings = getMarkdownHeadings(content);

  return (
    <>
      <JsonLd data={generateArticleSchema(post, locale)} />
      <ArticleEngagementTracker slug={post.slug} />
      <section aria-labelledby="article-title" className="blog-detail">
        <Container size="text">
          <BlogMeta locale={locale} post={post} />
          <Heading as="h1" className="blog-detail-title" id="article-title" size="display-md">
            <CjkPhraseText text={post.title} />
          </Heading>
          <p className="blog-detail-description">{post.description}</p>
          <p className="blog-detail-updated">
            {copy.blogDetail.lastUpdated}
            <time dateTime={post.updatedAt ?? post.publishedAt}>
              {formatBlogDate(post.updatedAt ?? post.publishedAt, locale)}
            </time>
          </p>
          <ArticleTableOfContents headings={headings} locale={locale} />
          <MarkdownContent content={content} />
          <RelatedContent
            locale={locale}
            post={post}
            posts={posts}
            projects={projects}
            services={services}
          />
          <Link className="blog-detail-back-link" href="/blog">
            {copy.blogDetail.back}
          </Link>
        </Container>
      </section>
    </>
  );
}
