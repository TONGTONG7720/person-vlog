'use client';

import { useDeferredValue, useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';

import { BlogCard } from '@/components/sections/blog/blog-card';
import {
  contentCategories,
  getContentCategoryLabels,
  type ContentCategory,
} from '@/config/content';
import { filterBlogPosts } from '@/lib/blog-search';
import type { BlogPost } from '@/types/blog';

type BlogDirectoryProps = Readonly<{
  readonly posts: readonly BlogPost[];
}>;

export function BlogDirectory({ posts }: BlogDirectoryProps): React.JSX.Element {
  const locale = useLocale() === 'en-US' ? 'en-US' : 'zh-CN';
  const t = useTranslations('blogDirectory');
  const [activeCategory, setActiveCategory] = useState<ContentCategory | 'all'>('all');
  const [activeTag, setActiveTag] = useState<string | undefined>();
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query.trim());
  const tags = useMemo(
    () =>
      Array.from(new Set(posts.flatMap((post) => post.tags))).toSorted((first, second) =>
        first.localeCompare(second, locale),
      ),
    [locale, posts],
  );
  const visiblePosts = filterBlogPosts(posts, {
    category: activeCategory,
    query: deferredQuery,
    ...(activeTag === undefined ? {} : { tag: activeTag }),
  });
  const categoryLabels = getContentCategoryLabels(locale);

  return (
    <div className="blog-directory">
      <div className="blog-directory-controls">
        <label>
          <span>{t('searchLabel')}</span>
          <input
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t('searchPlaceholder')}
            type="search"
            value={query}
          />
        </label>
        <div aria-label={t('categories')} className="blog-filter-group" role="group">
          <button
            aria-pressed={activeCategory === 'all'}
            onClick={() => setActiveCategory('all')}
            type="button"
          >
            {t('all')}
          </button>
          {contentCategories.map((category) => (
            <button
              aria-pressed={activeCategory === category.id}
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              type="button"
            >
              {categoryLabels[category.id]}
            </button>
          ))}
        </div>
      </div>
      <div aria-label={t('tags')} className="blog-filter-group blog-tag-filters" role="group">
        <button
          aria-pressed={activeTag === undefined}
          onClick={() => setActiveTag(undefined)}
          type="button"
        >
          {t('allTags')}
        </button>
        {tags.map((tag) => (
          <button
            aria-pressed={activeTag === tag}
            key={tag}
            onClick={() => setActiveTag(tag)}
            type="button"
          >
            {tag}
          </button>
        ))}
      </div>
      <p aria-live="polite" className="blog-directory-count">
        {t('count', { count: visiblePosts.length })}
      </p>
      {visiblePosts.length === 0 ? (
        <p className="blog-directory-empty">{t('empty')}</p>
      ) : (
        <div className="blog-post-grid blog-directory-grid">
          {visiblePosts.map((post) => (
            <div data-primary={post.isPrimary} key={post.slug}>
              <BlogCard locale={locale} post={post} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
