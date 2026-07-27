import { getLocalizedRecord, type LocalizedOverrides } from '@/i18n/content';
import type { Locale } from '@/types/i18n';
import type { BlogPost, BlogSectionContent } from '@/types/blog';

export const blogSectionContent = {
  closing: {
    actionLabel: '查看全部文章',
    statement: '长期积累的技术经验，最终会沉淀成可以复用的方法和解决方案。',
  },
  description: '分享 Java、Python、Vue、AI 应用开发经验，记录项目实践、架构设计和解决问题的方法。',
  eyebrow: 'JOURNAL',
  intro: {
    description: '技术文章不仅记录实现方式，也记录为什么这样设计，以及过程中遇到的问题。',
    title: '代码之外，我也记录解决问题的过程。',
  },
  number: '07',
  title: '持续记录，关于技术、产品与开发过程的思考。',
} as const satisfies BlogSectionContent;

const englishBlogSectionContent: BlogSectionContent = {
  closing: {
    actionLabel: 'View all articles',
    statement:
      'Long-term technical practice becomes reusable methods and more dependable product decisions.',
  },
  description:
    'Notes on Java, Python, Vue, AI applications and software architecture: real implementation decisions, trade-offs and ways through them.',
  eyebrow: 'JOURNAL',
  intro: {
    description:
      'Technical writing documents more than an implementation. It records why a direction was chosen and what had to be solved along the way.',
    title: 'Beyond the code, I document the work of solving a problem.',
  },
  number: '07',
  title: 'A continuing journal of technology, product thinking and the delivery process.',
};

export function getBlogSectionContent(locale: Locale): BlogSectionContent {
  return locale === 'en-US' ? englishBlogSectionContent : blogSectionContent;
}

export const blogPosts = [
  {
    author: '瞳瞳',
    category: 'backend',
    contentPath: 'src/content/blog/springboot-vue-management-system.mdx',
    coverVariant: 'enterprise-system',
    description:
      '从需求梳理、权限边界到前后端协作，记录一个企业管理系统如何在可维护性与交付节奏之间取得平衡。',
    draft: false,
    featured: true,
    isPrimary: true,
    keywords: ['Spring Boot 企业管理系统', 'Vue 管理后台', '权限设计', '企业系统架构'],
    publishedAt: '2026-07-25',
    readingTime: 8,
    relatedPosts: ['maintainable-admin-system'],
    relatedProjects: ['store-operations-system'],
    relatedServices: ['enterprise-system-development'],
    seoDescription:
      '从权限边界、接口约定到前后端协作，梳理 Spring Boot + Vue 企业管理系统的可维护设计方法。',
    seoTitle: 'Spring Boot + Vue 企业管理系统架构设计',
    slug: 'springboot-vue-management-system',
    status: 'published',
    tags: ['Java', 'Spring Boot', 'Vue', 'Architecture'],
    title: 'Spring Boot + Vue 企业管理系统开发完整记录',
    updatedAt: '2026-07-25',
  },
  {
    author: '瞳瞳',
    category: 'ai',
    contentPath: 'src/content/blog/rag-knowledge-system.mdx',
    coverVariant: 'rag-system',
    description:
      '围绕文档处理、检索链路与回答校验，拆解企业知识库 RAG 系统从原始资料到可追溯回答的关键设计。',
    draft: false,
    featured: true,
    isPrimary: false,
    keywords: ['企业 RAG 知识库', 'RAG 系统设计', '向量检索', 'LLM 应用开发'],
    publishedAt: '2026-07-18',
    readingTime: 10,
    relatedPosts: ['maintainable-admin-system'],
    relatedProjects: ['enterprise-rag-knowledge-base'],
    relatedServices: ['ai-application-development'],
    seoDescription: '从文档处理、检索链路到回答校验，拆解企业知识库 RAG 系统的关键设计与边界。',
    seoTitle: '企业知识库 RAG 系统设计指南',
    slug: 'rag-knowledge-system',
    status: 'published',
    tags: ['AI', 'Python', 'RAG', 'LLM'],
    title: '从零构建企业知识库 RAG 系统',
    updatedAt: '2026-07-22',
  },
  {
    author: '瞳瞳',
    category: 'engineering',
    contentPath: 'src/content/blog/maintainable-admin-system.mdx',
    coverVariant: 'architecture-system',
    description:
      '从模块边界、权限模型到数据流设计，梳理一个后台管理系统在持续迭代中仍然保持清晰的实现方法。',
    draft: false,
    featured: true,
    isPrimary: false,
    keywords: ['后台管理系统架构', '可维护系统设计', '权限模型', '工程实践'],
    publishedAt: '2026-07-10',
    readingTime: 7,
    relatedPosts: ['springboot-vue-management-system', 'rag-knowledge-system'],
    relatedProjects: ['store-operations-system'],
    relatedServices: ['system-upgrade-and-maintenance'],
    seoDescription: '从模块边界、权限模型与数据流设计出发，说明后台系统如何保持长期可维护。',
    seoTitle: '如何设计一个长期可维护的后台管理系统',
    slug: 'maintainable-admin-system',
    status: 'published',
    tags: ['Architecture', 'Backend', 'Engineering'],
    title: '如何设计一个可维护的后台管理系统',
    updatedAt: '2026-07-15',
  },
] as const satisfies readonly BlogPost[];

const blogCopyBySlug = {
  'maintainable-admin-system': {
    'en-US': {
      author: 'Tong',
      contentPath: 'src/content/blog/en-US/maintainable-admin-system.mdx',
      description:
        'A practical look at module boundaries, permissions and data flow for an admin system that stays understandable as it evolves.',
      keywords: [
        'maintainable admin system',
        'software architecture',
        'permission model',
        'engineering practice',
      ],
      seoDescription:
        'A practical guide to keeping an admin system maintainable through module boundaries, permission models and clear data flows.',
      seoTitle: 'How to Design a Maintainable Admin System',
      tags: ['Architecture', 'Backend', 'Engineering'],
      title: 'How to Design a Maintainable Admin System',
    },
  },
  'rag-knowledge-system': {
    'en-US': {
      author: 'Tong',
      contentPath: 'src/content/blog/en-US/rag-knowledge-system.mdx',
      description:
        'A practical breakdown of document processing, retrieval and answer validation for an enterprise RAG knowledge system.',
      keywords: [
        'enterprise RAG knowledge base',
        'RAG system design',
        'vector retrieval',
        'LLM application development',
      ],
      seoDescription:
        'A guide to designing an enterprise RAG knowledge system, from document ingestion and retrieval to grounded answer validation.',
      seoTitle: 'A Practical Guide to Enterprise RAG Knowledge Systems',
      tags: ['AI', 'Python', 'RAG', 'LLM'],
      title: 'Building an Enterprise RAG Knowledge System from First Principles',
    },
  },
  'springboot-vue-management-system': {
    'en-US': {
      author: 'Tong',
      contentPath: 'src/content/blog/en-US/springboot-vue-management-system.mdx',
      description:
        'A practical account of balancing maintainability and delivery pace across discovery, permission boundaries and Spring Boot + Vue collaboration.',
      keywords: [
        'Spring Boot admin system',
        'Vue operations interface',
        'permission design',
        'enterprise software architecture',
      ],
      seoDescription:
        'A maintainable Spring Boot + Vue admin system: permission boundaries, API contracts and frontend-backend collaboration.',
      seoTitle: 'Building a Maintainable Spring Boot + Vue Admin System',
      tags: ['Java', 'Spring Boot', 'Vue', 'Architecture'],
      title: 'Building a Maintainable Spring Boot + Vue Admin System',
    },
  },
} as const satisfies Readonly<Record<string, LocalizedOverrides<BlogPost>>>;

export function getLocalizedBlogPosts(locale: Locale): readonly BlogPost[] {
  return blogPosts.map((post) =>
    getLocalizedRecord<BlogPost>(post, locale, blogCopyBySlug[post.slug]),
  );
}

export function getLocalizedBlogPostBySlug(slug: string, locale: Locale): BlogPost | undefined {
  return getLocalizedBlogPosts(locale).find((post) => post.slug === slug);
}
