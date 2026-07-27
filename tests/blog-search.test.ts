import { describe, expect, it } from 'vitest';

import { blogPosts } from '../src/content/blog/posts';
import { filterBlogPosts } from '../src/lib/blog-search';

describe('博客本地搜索与筛选', () => {
  it('可按文章标题、标签和关键词筛选公开内容', () => {
    expect(
      filterBlogPosts(blogPosts, { category: 'all', query: '企业 RAG 知识库' }).map(
        (post) => post.slug,
      ),
    ).toEqual(['rag-knowledge-system']);

    expect(
      filterBlogPosts(blogPosts, { category: 'backend', query: '', tag: 'Java' }).map(
        (post) => post.slug,
      ),
    ).toEqual(['springboot-vue-management-system']);
  });
});
