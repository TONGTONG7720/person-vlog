import { getLocalizedRecord, type LocalizedOverrides } from '@/i18n/content';
import type { Locale } from '@/types/i18n';
import type { Project } from '@/types/project';

export const projectsSectionContent = {
  closingLines: ['技术栈会变化，', '但理解问题、设计方案和完成交付的能力不会。'],
  description:
    '从企业管理系统、自动化平台到 AI 应用，每个项目都围绕具体场景进行产品设计、技术选型与完整实现。',
  eyebrow: 'SELECTED WORK',
  intro: '从需求理解，到技术方案、开发实现与上线准备。',
  summary: '这些项目覆盖了企业系统、自动化平台与 AI 应用，也代表了我目前最希望持续深入的产品方向。',
  title: '不是展示功能数量，而是展示我如何解决真实问题。',
} as const;

export const projectCoverage = [
  '企业业务系统',
  'AI 产品',
  '知识库',
  '自动化工具',
  '前后端开发',
  '部署上线',
] as const;

export type ProjectsSectionCopy = Readonly<{
  readonly content: Readonly<{
    readonly closingLines: readonly [string, string];
    readonly description: string;
    readonly eyebrow: string;
    readonly intro: string;
    readonly summary: string;
    readonly title: string;
  }>;
  readonly coverage: readonly string[];
  readonly labels: Readonly<{
    readonly caseStudy: string;
    readonly contact: string;
    readonly challenge: string;
    readonly solution: string;
    readonly technologies: string;
    readonly viewAll: string;
  }>;
}>;

const englishProjectsSectionCopy: ProjectsSectionCopy = {
  content: {
    closingLines: [
      'Technology changes,',
      'but the ability to understand a problem, design a solution and deliver it remains.',
    ],
    description:
      'From enterprise operations and automation to AI products, each project starts with a concrete situation, deliberate technical choices and a complete delivery path.',
    eyebrow: 'SELECTED WORK',
    intro: 'From clarifying the need to designing, building and preparing for launch.',
    summary:
      'These projects span business systems, automation platforms and AI applications: the product directions I am continuing to deepen.',
    title: 'Not a list of features, but how I approach real problems.',
  },
  coverage: [
    'Business systems',
    'AI products',
    'Knowledge systems',
    'Automation tools',
    'Full-stack delivery',
    'Deployment readiness',
  ],
  labels: {
    caseStudy: 'View case study',
    challenge: 'Challenge',
    contact: 'Have a similar need? Let’s talk.',
    solution: 'Approach',
    technologies: 'Technology stack',
    viewAll: 'View all projects',
  },
};

const chineseProjectsSectionCopy: ProjectsSectionCopy = {
  content: projectsSectionContent,
  coverage: projectCoverage,
  labels: {
    caseStudy: '查看案例',
    challenge: '问题',
    contact: '有类似需求？联系合作',
    solution: '方案',
    technologies: '技术栈',
    viewAll: '查看全部项目',
  },
};

export function getProjectsSectionCopy(locale: Locale): ProjectsSectionCopy {
  return locale === 'en-US' ? englishProjectsSectionCopy : chineseProjectsSectionCopy;
}

export const projects = [
  {
    accent: 'violet',
    category: ['enterprise-system', 'java', 'vue', 'full-stack'],
    challenge: '门店、订单与库存信息分散，日常运营需要在多个流程之间反复切换。',
    title: '连锁门店运营管理系统',
    slug: 'store-operations-system',
    description: '为多门店运营场景梳理订单、库存与门店协作流程的系统化方案。',
    previewType: 'store-dashboard',
    projectType: 'personal',
    solution: '以统一运营视图组织关键流程，并为后端规则与前端协作预留清晰边界。',
    technologies: ['Java', 'Spring Boot', 'Vue 3', 'MySQL'],
    year: 2026,
    status: 'concept',
    featured: true,
    featuredOrder: 1,
  },
  {
    accent: 'cyan',
    category: ['ai', 'python', 'full-stack'],
    challenge: '业务问题和知识来源缺少统一入口，用户难以快速获得可追溯的回答。',
    title: 'AI 智能问答平台',
    slug: 'ai-question-answering-platform',
    description: '围绕业务提问、上下文组织与回答反馈设计的 AI 应用方向。',
    previewType: 'ai-chat',
    projectType: 'personal',
    solution: '将对话、引用提示与后续人工校正拆分为可迭代的产品与服务层。',
    technologies: ['Python', 'FastAPI', 'LLM', 'Vector Database'],
    year: 2026,
    status: 'concept',
    featured: true,
    featuredOrder: 2,
  },
  {
    accent: 'blue',
    category: ['knowledge-system', 'ai', 'python'],
    challenge: '企业文档分散且检索路径长，内部知识难以成为可被稳定调用的工作能力。',
    title: '企业知识库 RAG 系统',
    slug: 'enterprise-rag-knowledge-base',
    description: '面向文档接入、知识检索与回答引用链路的 RAG 系统方案。',
    previewType: 'knowledge-retrieval',
    projectType: 'personal',
    solution: '用文档处理、向量检索与来源关联构建可持续维护的知识查询流程。',
    technologies: ['Python', 'RAG', 'Embedding', 'Vue 3'],
    year: 2026,
    status: 'concept',
    featured: true,
    featuredOrder: 3,
  },
  {
    accent: 'amber',
    category: ['automation', 'java', 'vue'],
    challenge: '数字商品交付依赖重复操作，订单确认、凭证生成与交付通知缺少稳定衔接。',
    title: '卡密自动发货系统',
    slug: 'digital-delivery-system',
    description: '围绕订单状态、交付凭证与通知流程整理的自动化交付系统方向。',
    previewType: 'digital-delivery',
    projectType: 'personal',
    solution: '将订单处理、库存校验与交付消息划分为清晰节点，减少重复人工处理。',
    technologies: ['Java', 'Spring Boot', 'Vue 3', 'Redis'],
    year: 2026,
    status: 'concept',
    featured: true,
    featuredOrder: 4,
  },
] as const satisfies readonly Project[];

const projectCopyBySlug = {
  'ai-question-answering-platform': {
    'en-US': {
      challenge:
        'Business questions and source material often live in separate places, making it hard to provide quick answers with traceable context.',
      description:
        'An AI product direction designed around business questions, context orchestration and answer feedback.',
      solution:
        'Separates conversations, citations and human correction into product and service layers that can evolve independently.',
      title: 'AI Question Answering Platform',
    },
  },
  'digital-delivery-system': {
    'en-US': {
      challenge:
        'Digital delivery still relies on repetitive manual work, while order confirmation, credential generation and customer notification are loosely connected.',
      description:
        'An automated delivery system direction built around order state, fulfillment credentials and notification flows.',
      solution:
        'Models order handling, stock validation and delivery messaging as clear, observable steps to reduce manual work.',
      title: 'Digital Delivery Automation System',
    },
  },
  'enterprise-rag-knowledge-base': {
    'en-US': {
      challenge:
        'Company documents are fragmented and difficult to search, so internal knowledge cannot become a dependable working capability.',
      description:
        'A RAG system direction for document ingestion, knowledge retrieval and evidence-linked answers.',
      solution:
        'Combines document processing, vector retrieval and source association into a knowledge query flow that is maintainable over time.',
      title: 'Enterprise RAG Knowledge Base',
    },
  },
  'store-operations-system': {
    'en-US': {
      challenge:
        'Store, order and inventory information is fragmented, forcing operators to jump repeatedly between disconnected daily workflows.',
      description:
        'A structured operations platform for multi-location teams, covering orders, inventory and store collaboration.',
      solution:
        'Organizes core workflows around a unified operations view while keeping clear boundaries between backend rules and frontend collaboration.',
      title: 'Multi-Location Operations System',
    },
  },
} as const satisfies Readonly<Record<string, LocalizedOverrides<Project>>>;

export function getLocalizedProjects(locale: Locale): readonly Project[] {
  return projects.map((project) =>
    getLocalizedRecord<Project>(project, locale, projectCopyBySlug[project.slug]),
  );
}

export function getLocalizedProjectBySlug(slug: string, locale: Locale): Project | undefined {
  return getLocalizedProjects(locale).find((project) => project.slug === slug);
}

export const featuredProjects = projects
  .filter((project) => project.featured)
  .sort((first, second) => (first.featuredOrder ?? 0) - (second.featuredOrder ?? 0));

export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((project) => project.slug === slug);
}
