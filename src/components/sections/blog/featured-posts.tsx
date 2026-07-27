import { Reveal } from '@/components/animation/reveal';
import { BlogCard } from '@/components/sections/blog/blog-card';
import type { BlogPost } from '@/types/blog';
import type { Locale } from '@/types/i18n';

export type FeaturedPostsProps = Readonly<{
  locale: Locale;
  posts: readonly BlogPost[];
}>;

export function FeaturedPosts({ locale, posts }: FeaturedPostsProps): React.JSX.Element {
  return (
    <div className="blog-post-grid">
      {posts.map((post, index) => (
        <div data-primary={post.isPrimary} key={post.slug}>
          <Reveal
            className="blog-post-reveal"
            delay={index * 0.08}
            distance={18}
            duration={0.64}
            variant="fade-up"
          >
            <BlogCard locale={locale} post={post} />
          </Reveal>
        </div>
      ))}
    </div>
  );
}
