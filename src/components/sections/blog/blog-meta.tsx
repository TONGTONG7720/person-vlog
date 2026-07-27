import { getContentCategoryLabels } from '@/config/content';
import { formatBlogDate } from '@/lib/blog-format';
import type { BlogPost } from '@/types/blog';
import type { Locale } from '@/types/i18n';

export type BlogMetaProps = Readonly<{
  locale?: Locale;
  post: BlogPost;
}>;

export function BlogMeta({ locale = 'zh-CN', post }: BlogMetaProps): React.JSX.Element {
  const categoryLabels = getContentCategoryLabels(locale);
  const readingTime =
    locale === 'en-US' ? `${post.readingTime} min read` : `${post.readingTime} 分钟阅读`;

  return (
    <p className="blog-meta">
      <span>{categoryLabels[post.category]}</span>
      <span>{readingTime}</span>
      <time dateTime={post.publishedAt}>{formatBlogDate(post.publishedAt, locale)}</time>
    </p>
  );
}
