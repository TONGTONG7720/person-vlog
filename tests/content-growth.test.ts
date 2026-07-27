import { describe, expect, it } from 'vitest';

import { contentCategories, topicClusters } from '../src/config/content';
import { getContentQualityIssues, getRelatedBlogPosts } from '../src/lib/blog';
import type { BlogPost } from '../src/types/blog';

const sourcePost: BlogPost = {
  author: '瞳瞳',
  category: 'ai',
  contentPath: 'src/content/blog/rag-knowledge-system.mdx',
  coverVariant: 'rag-system',
  description: '围绕企业知识库的资料治理、检索和回答校验，梳理可持续维护的 RAG 方案。',
  draft: false,
  featured: true,
  isPrimary: false,
  keywords: ['企业 RAG 知识库', 'RAG 系统设计'],
  publishedAt: '2026-07-18',
  readingTime: 10,
  relatedPosts: [],
  relatedProjects: [],
  relatedServices: [],
  slug: 'rag-knowledge-system',
  status: 'published',
  tags: ['AI', 'RAG', 'LLM'],
  title: '从零构建企业知识库 RAG 系统',
};

const relatedByProject: BlogPost = {
  ...sourcePost,
  category: 'engineering',
  relatedProjects: ['enterprise-rag-knowledge-base'],
  slug: 'rag-architecture',
  tags: ['Architecture'],
  title: 'RAG 系统的可维护架构',
};

const unrelatedPost: BlogPost = {
  ...sourcePost,
  category: 'backend',
  slug: 'java-api-boundaries',
  tags: ['Java'],
  title: 'Spring Boot API 边界设计',
};

describe('内容增长基础规则', () => {
  it('提供五个面向搜索意图的内容分类和主题集群', () => {
    expect(contentCategories.map((category) => category.id)).toEqual([
      'backend',
      'frontend',
      'ai',
      'project',
      'engineering',
    ]);
    expect(
      topicClusters.find((cluster) => cluster.id === 'ai-application-development')?.pillarTitle,
    ).toBe('企业 RAG 系统完整指南');
  });

  it('优先推荐存在关联项目的文章，并排除当前文章', () => {
    const relatedPosts = getRelatedBlogPosts({
      currentPost: { ...sourcePost, relatedProjects: ['enterprise-rag-knowledge-base'] },
      posts: [sourcePost, relatedByProject, unrelatedPost],
    });

    expect(relatedPosts.map((post) => post.slug)).toEqual(['rag-architecture']);
  });

  it('发布前指出缺失的 SEO 与可读性项，但不虚构内容质量', () => {
    const issues = getContentQualityIssues({
      content: '这是一段没有标题层级的短正文。',
      description: '',
      keywords: [],
      relatedProjects: [],
      relatedServices: [],
      seoDescription: '',
      seoTitle: '',
      title: '短标题',
    });

    expect(issues.map((issue) => issue.code)).toEqual(
      expect.arrayContaining([
        'missing-description',
        'missing-heading',
        'missing-keywords',
        'missing-seo',
      ]),
    );
  });
});
