import { ArrowUpRight } from 'lucide-react';

import { BlogMediaReveal } from '@/components/sections/blog/blog-media-reveal';
import { BlogMeta } from '@/components/sections/blog/blog-meta';
import { BlogPlaceholder } from '@/components/sections/blog/blog-placeholder';
import { Link } from '@/i18n/navigation';
import type { BlogPost } from '@/types/blog';
import type { Locale } from '@/types/i18n';

export type BlogCardProps = Readonly<{
  locale: Locale;
  post: BlogPost;
}>;

export function BlogCard({ locale, post }: BlogCardProps): React.JSX.Element {
  const titleId = `blog-post-${post.slug}-title`;
  const copy =
    locale === 'en-US'
      ? { action: 'Read article', aria: `Read article: ${post.title}` }
      : { action: '查看文章', aria: `查看文章：${post.title}` };
  return (
    <article
      aria-labelledby={titleId}
      className="blog-card"
      data-cover={post.coverVariant}
      data-featured={post.featured}
      data-primary={post.isPrimary}
    >
      <Link aria-label={copy.aria} className="blog-card-link" href={`/blog/${post.slug}`}>
        <BlogMediaReveal className="blog-card-media">
          <BlogPlaceholder variant={post.coverVariant} />
        </BlogMediaReveal>
        <div className="blog-card-content">
          <BlogMeta locale={locale} post={post} />
          <h3 id={titleId}>{post.title}</h3>
          <span className="blog-card-action">
            <span>{copy.action}</span>
            <ArrowUpRight aria-hidden="true" size={17} strokeWidth={1.5} />
          </span>
        </div>
      </Link>
    </article>
  );
}
