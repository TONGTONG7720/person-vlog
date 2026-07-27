import { BlogDirectory } from '@/components/content/blog-directory';
import { Container } from '@/components/ui/container';
import { Heading } from '@/components/ui/heading';
import { getPublicPageCopy } from '@/i18n/page-copy';
import { getRequestLocale } from '@/i18n/server';
import { createMetadata } from '@/lib/metadata';
import { getPublicBlogPosts } from '@/server/cms/public-content';

export async function generateMetadata() {
  const locale = await getRequestLocale();
  const copy = getPublicPageCopy(locale);

  return createMetadata({
    description: copy.blog.description,
    locale,
    path: '/blog',
    title: copy.blog.title,
  });
}

export const dynamic = 'force-dynamic';

export default async function BlogPage(): Promise<React.JSX.Element> {
  const locale = await getRequestLocale();
  const [posts, copy] = await Promise.all([getPublicBlogPosts(locale), getPublicPageCopy(locale)]);

  return (
    <section aria-labelledby="blog-page-title" className="blog-section">
      <Container size="content">
        <p className="projects-directory-eyebrow">{copy.blog.eyebrow}</p>
        <Heading as="h1" id="blog-page-title" size="display-md">
          {copy.blog.title}
        </Heading>
        <p className="projects-directory-intro">{copy.blog.description}</p>
        <BlogDirectory posts={posts} />
      </Container>
    </section>
  );
}
