import { ArrowUpRight } from 'lucide-react';

import { FeaturedPosts } from '@/components/sections/blog/featured-posts';
import { SectionHeading } from '@/components/typography/section-heading';
import { Container } from '@/components/ui/container';
import { getBlogSectionContent } from '@/content/blog/posts';
import { getRequestLocale } from '@/i18n/server';
import { Link } from '@/i18n/navigation';
import { getPublicFeaturedPosts } from '@/server/cms/public-content';

export async function BlogSection(): Promise<React.JSX.Element> {
  const locale = await getRequestLocale();
  const [featuredPosts, content] = await Promise.all([
    getPublicFeaturedPosts(locale),
    getBlogSectionContent(locale),
  ]);

  return (
    <section aria-labelledby="blog-heading" className="blog-section" id="blog">
      <Container size="content">
        <SectionHeading
          action={
            <Link className="blog-home-directory-link" href="/blog">
              <span>{content.closing.actionLabel}</span>
              <ArrowUpRight aria-hidden="true" size={18} strokeWidth={1.5} />
            </Link>
          }
          animated
          description={content.description}
          eyebrow={content.eyebrow}
          id="blog-heading"
          number={content.number}
          size="lg"
          title={content.title}
        />
        <FeaturedPosts locale={locale} posts={featuredPosts} />
      </Container>
    </section>
  );
}
