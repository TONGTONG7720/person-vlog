import Fuse from 'fuse.js';

import type { ContentCategory } from '@/config/content';
import type { BlogPost } from '@/types/blog';

export type BlogSearchFilters = Readonly<{
  readonly category: ContentCategory | 'all';
  readonly query: string;
  readonly tag?: string;
}>;

export function filterBlogPosts(
  posts: readonly BlogPost[],
  filters: BlogSearchFilters,
): readonly BlogPost[] {
  const query = filters.query.trim();
  const matchingPosts =
    query === ''
      ? posts
      : new Fuse(posts, {
          ignoreLocation: true,
          keys: ['description', 'keywords', 'tags', 'title'],
          threshold: 0.36,
        })
          .search(query)
          .map(({ item }) => item);

  return matchingPosts.filter(
    (post) =>
      (filters.category === 'all' || post.category === filters.category) &&
      (filters.tag === undefined || post.tags.includes(filters.tag)),
  );
}
