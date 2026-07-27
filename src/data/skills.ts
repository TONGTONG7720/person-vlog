import type { SkillGroup, SkillGroupId, SkillLevel, SkillsSectionContent } from '@/types/skill';
import type { Locale } from '@/types/i18n';

export const skillsSectionContent = {
  closingLines: ['不同技术负责不同部分，', '最终目标始终是交付一个可靠、清晰、可维护的产品。'],
  description:
    '从后端业务逻辑、前端交互、数据库与部署，到 AI 能力集成，我关注的是如何把不同技术组合成稳定、可维护、可上线的软件系统。',
  eyebrow: 'CAPABILITIES',
  flow: ['需求分析', '产品方案', '前后端开发', '数据与部署', 'AI 能力集成'],
  number: '03',
  overviewLabels: ['完整交付', '前后端协作', 'AI 能力集成'],
  overviewDescription:
    '一个完整的软件产品，往往需要后端、前端、数据、部署与 AI 能力共同协作。下面展示的是我目前可以用于项目开发的主要技术方向。',
  overviewTitle: '我更擅长把技术组合起来，而不是孤立地使用某个框架。',
  title: '技术不是孤立的工具，而是一套完整的产品实现能力。',
} as const satisfies SkillsSectionContent;

export const skillLevelLabels = {
  core: '核心能力',
  exploring: '持续探索',
  working: '项目使用',
} as const satisfies Record<SkillLevel, string>;

const englishSkillsSectionContent = {
  closingLines: [
    'Each technology has a different role.',
    'The shared goal is a dependable, clear and maintainable product.',
  ],
  description:
    'From backend logic and frontend interaction to data, deployment and AI integration, I focus on combining the right tools into stable software that can be maintained and shipped.',
  eyebrow: 'CAPABILITIES',
  flow: [
    'Discovery',
    'Product plan',
    'Full-stack development',
    'Data and delivery',
    'AI integration',
  ],
  number: '03',
  overviewLabels: ['End-to-end delivery', 'Frontend and backend', 'AI integration'],
  overviewDescription:
    'A complete software product requires backend, frontend, data, deployment and AI capabilities to work together. These are the areas I can bring into a product delivery today.',
  overviewTitle:
    'I am stronger at combining technology into a product than using a framework in isolation.',
  title: 'Technology is not an isolated tool. It is the capacity to build a complete product.',
} as const satisfies SkillsSectionContent;

const englishSkillLevelLabels = {
  core: 'Core capability',
  exploring: 'Exploring',
  working: 'Used in projects',
} as const satisfies Record<SkillLevel, string>;

export type SkillsUiCopy = Readonly<{
  readonly active: string;
  readonly capabilities: string;
  readonly countSuffix: string;
  readonly module: string;
  readonly overviewFlowAriaLabel: string;
  readonly overviewLabelsAriaLabel: string;
  readonly productLabel: string;
  readonly systemNodes: Readonly<Record<SkillGroupId, string>>;
  readonly technologyScope: string;
  readonly viewProjects: string;
}>;

const skillsUiCopyByLocale = {
  'en-US': {
    active: 'Viewing now',
    capabilities: 'Best for',
    countSuffix: 'technologies',
    module: 'Capability module',
    overviewFlowAriaLabel: 'Delivery flow',
    overviewLabelsAriaLabel: 'Capability coverage',
    productLabel: 'Usable software product',
    systemNodes: {
      ai: 'AI capability',
      backend: 'Backend systems',
      data: 'Data and delivery',
      frontend: 'Frontend experience',
    },
    technologyScope: 'Technology and use cases',
    viewProjects: 'See how these capabilities become projects',
  },
  'zh-CN': {
    active: '当前查看',
    capabilities: '适用场景',
    countSuffix: '项技术',
    module: '能力模块',
    overviewFlowAriaLabel: '能力覆盖流程',
    overviewLabelsAriaLabel: '能力覆盖范围',
    productLabel: '可用的软件产品',
    systemNodes: {
      ai: 'AI 能力',
      backend: '后端系统',
      data: '数据与部署',
      frontend: '前端体验',
    },
    technologyScope: '技术与使用范围',
    viewProjects: '查看我如何把这些能力应用到项目中',
  },
} as const satisfies Readonly<Record<Locale, SkillsUiCopy>>;

// 能力等级应随真实项目经验变化更新；不以熟练度百分比代替实际使用范围。
export const skillGroups = [
  {
    accent: 'backend',
    capabilities: [
      '企业管理系统',
      '业务平台',
      'API 服务',
      '权限体系',
      '后台任务',
      '第三方系统对接',
    ],
    description:
      '负责业务逻辑、权限体系、接口设计、任务处理与核心服务，让系统结构清晰、便于维护和持续扩展。',
    id: 'backend',
    number: '01',
    shortTitle: '后端系统',
    skills: [
      {
        description: '用于构建稳定的业务系统、接口服务与企业应用。',
        id: 'java',
        level: 'core',
        name: 'Java',
        related: ['spring-boot', 'mysql', 'redis'],
      },
      {
        description: '用于搭建模块清晰、易于扩展的后端服务。',
        id: 'spring-boot',
        level: 'core',
        name: 'Spring Boot',
        related: ['java', 'spring-security', 'mybatis-plus'],
      },
      {
        description: '用于账户、角色、权限与访问控制等常见场景。',
        id: 'spring-security',
        level: 'working',
        name: 'Spring Security',
        related: ['spring-boot', 'java'],
      },
      {
        description: '用于常见数据访问与业务持久化开发。',
        id: 'mybatis-plus',
        level: 'working',
        name: 'MyBatis Plus',
        related: ['java', 'mysql'],
      },
      {
        description: '用于 Web 服务、自动化与数据处理能力扩展。',
        id: 'python',
        level: 'core',
        name: 'Python',
        related: ['fastapi', 'rag', 'ai-agent'],
      },
      {
        description: '用于构建轻量、类型清晰的 Python API 服务。',
        id: 'fastapi',
        level: 'core',
        name: 'FastAPI',
        related: ['python', 'openai-api'],
      },
    ],
    title: '后端与业务系统',
  },
  {
    accent: 'frontend',
    capabilities: ['管理后台', '数据平台', '企业官网', '内容系统', '产品原型', '响应式界面'],
    description:
      '把需求与产品方案转化为清晰、易用、响应式的界面，让接口、状态、交互与内容共同形成可操作的产品体验。',
    id: 'frontend',
    number: '02',
    shortTitle: '前端体验',
    skills: [
      {
        description: '用于开发管理后台、数据平台与业务 Web 界面。',
        id: 'vue',
        level: 'core',
        name: 'Vue 3',
        related: ['typescript', 'pinia', 'vue-router'],
      },
      {
        description: '用于让前端数据与组件边界更清晰、可维护。',
        id: 'typescript',
        level: 'core',
        name: 'TypeScript',
        related: ['vue', 'react', 'nextjs'],
      },
      {
        description: '用于快速组织现代前端项目的开发与构建流程。',
        id: 'vite',
        level: 'working',
        name: 'Vite',
        related: ['vue', 'typescript'],
      },
      {
        description: '用于管理中小型业务界面的客户端状态。',
        id: 'pinia',
        level: 'working',
        name: 'Pinia',
        related: ['vue', 'vue-router'],
      },
      {
        description: '用于交付一致的后台控件与数据录入体验。',
        id: 'element-plus',
        level: 'working',
        name: 'Element Plus',
        related: ['vue', 'typescript'],
      },
      {
        description: '用于服务端渲染、内容型页面与互动式网站探索。',
        id: 'nextjs',
        level: 'working',
        name: 'React / Next.js',
        related: ['typescript', 'tailwind-css'],
      },
    ],
    title: '前端与产品体验',
  },
  {
    accent: 'data',
    capabilities: ['数据库设计', '缓存设计', '容器部署', '服务器配置', '性能优化', '持续交付准备'],
    description:
      '处理数据结构、缓存、部署、反向代理、环境配置与版本管理，让项目能从本地开发顺利进入稳定运行状态。',
    id: 'data',
    number: '03',
    shortTitle: '数据与部署',
    skills: [
      {
        description: '用于业务数据建模、查询与关系型数据管理。',
        id: 'mysql',
        level: 'core',
        name: 'MySQL',
        related: ['redis', 'mybatis-plus', 'docker'],
      },
      {
        description: '用于理解并适配不同关系型数据库部署场景。',
        id: 'postgresql',
        level: 'working',
        name: 'PostgreSQL',
        related: ['docker', 'vector-database'],
      },
      {
        description: '用于缓存、会话与高频数据访问等常见场景。',
        id: 'redis',
        level: 'core',
        name: 'Redis',
        related: ['java', 'mysql'],
      },
      {
        description: '用于统一开发与部署环境，降低交付差异。',
        id: 'docker',
        level: 'core',
        name: 'Docker',
        related: ['nginx', 'linux'],
      },
      {
        description: '用于反向代理、静态资源与服务入口配置。',
        id: 'nginx',
        level: 'working',
        name: 'Nginx',
        related: ['docker', 'linux'],
      },
      {
        description: '用于部署环境、服务排查与日常工程协作。',
        id: 'linux',
        level: 'working',
        name: 'Linux / Git',
        related: ['docker', 'nginx'],
      },
    ],
    title: '数据库与基础设施',
  },
  {
    accent: 'ai',
    capabilities: ['企业知识库', '智能客服', 'AI 问答', '文档分析', '自动化助手', '业务 Agent'],
    description:
      '将大模型、知识库、检索增强与自动化能力接入已有系统，探索把 AI 从演示功能变成可验证、可使用的产品能力。',
    id: 'ai',
    number: '04',
    shortTitle: 'AI 能力',
    skills: [
      {
        description: '用于把对话、生成与结构化能力接入应用服务。',
        id: 'openai-api',
        level: 'working',
        name: 'OpenAI API',
        related: ['rag', 'prompt-engineering'],
      },
      {
        description: '用于让业务文档与大模型形成可追溯的问答流程。',
        id: 'rag',
        level: 'working',
        name: 'RAG',
        related: ['embedding', 'vector-database', 'openai-api'],
      },
      {
        description: '用于文档语义检索与相关内容召回。',
        id: 'embedding',
        level: 'working',
        name: 'Embedding',
        related: ['rag', 'vector-database'],
      },
      {
        description: '用于持续探索知识检索的索引与存储方案。',
        id: 'vector-database',
        level: 'exploring',
        name: 'Vector Database',
        related: ['embedding', 'rag'],
      },
      {
        description: '用于探索多步骤任务编排与工具协作。',
        id: 'langchain',
        level: 'exploring',
        name: 'LangChain',
        related: ['ai-agent', 'rag'],
      },
      {
        description: '用于持续研究业务流程中的工具调用与自动化协作。',
        id: 'ai-agent',
        level: 'exploring',
        name: 'AI Agent',
        related: ['langchain', 'openai-api'],
      },
    ],
    title: 'AI 与智能应用',
  },
] as const satisfies readonly SkillGroup[];

type EnglishSkillGroupCopy = Readonly<{
  readonly capabilities: readonly string[];
  readonly description: string;
  readonly shortTitle: string;
  readonly skills: Readonly<Record<string, string>>;
  readonly title: string;
}>;

const englishSkillGroupCopy = {
  ai: {
    capabilities: [
      'Enterprise knowledge bases',
      'AI support',
      'AI Q&A',
      'Document analysis',
      'Automation assistants',
      'Business agents',
    ],
    description:
      'I connect LLMs, knowledge bases, retrieval and automation to existing systems, with a focus on turning AI from a demo into a useful and verifiable product capability.',
    shortTitle: 'AI capability',
    skills: {
      'ai-agent': 'For researching tool use and automated collaboration in business workflows.',
      embedding: 'For semantic document retrieval and relevant-content recall.',
      langchain: 'For exploring multi-step task orchestration and tool coordination.',
      rag: 'For building traceable question-and-answer workflows over business documents.',
      'openai-api':
        'For integrating conversational, generative and structured capabilities into applications.',
      'vector-database': 'For exploring indexing and storage approaches for knowledge retrieval.',
    },
    title: 'AI and intelligent applications',
  },
  backend: {
    capabilities: [
      'Enterprise systems',
      'Business platforms',
      'API services',
      'Access control',
      'Background jobs',
      'Third-party integrations',
    ],
    description:
      'I build business logic, access control, APIs, background tasks and core services so a system stays clear, maintainable and ready to evolve.',
    shortTitle: 'Backend systems',
    skills: {
      fastapi: 'For lightweight, clearly typed Python API services.',
      java: 'For dependable business systems, APIs and enterprise applications.',
      'mybatis-plus': 'For common data access and business persistence work.',
      python: 'For web services, automation and data-processing capabilities.',
      'spring-boot': 'For backend services with clear modules and room to grow.',
      'spring-security': 'For accounts, roles, permissions and access-control scenarios.',
    },
    title: 'Backend and business systems',
  },
  data: {
    capabilities: [
      'Database design',
      'Caching design',
      'Container delivery',
      'Server configuration',
      'Performance work',
      'Continuous delivery readiness',
    ],
    description:
      'I work across data structures, caching, deployment, reverse proxying, environment configuration and version control so a project can move from local development to reliable operation.',
    shortTitle: 'Data and delivery',
    skills: {
      docker:
        'For consistent development and deployment environments with fewer handoff differences.',
      linux:
        'For deployment environments, service diagnosis and everyday engineering collaboration.',
      mysql: 'For business data modeling, queries and relational data management.',
      nginx: 'For reverse proxying, static resources and service entry configuration.',
      postgresql:
        'For understanding and adapting to different relational database deployment scenarios.',
      redis: 'For common caching, sessions and high-frequency data-access scenarios.',
    },
    title: 'Databases and infrastructure',
  },
  frontend: {
    capabilities: [
      'Admin dashboards',
      'Data platforms',
      'Company websites',
      'Content systems',
      'Product prototypes',
      'Responsive interfaces',
    ],
    description:
      'I turn requirements and product plans into clear, responsive interfaces where APIs, state, interaction and content work together as an operable product experience.',
    shortTitle: 'Frontend experience',
    skills: {
      'element-plus': 'For a consistent set of admin controls and data-entry experiences.',
      nextjs: 'For server-rendered, content-rich and interactive web experiences.',
      pinia: 'For client state in small and medium business interfaces.',
      typescript: 'For clearer, more maintainable data and component boundaries.',
      vite: 'For modern frontend project setup and build workflows.',
      vue: 'For admin dashboards, data platforms and business web interfaces.',
    },
    title: 'Frontend and product experience',
  },
} as const satisfies Readonly<Record<SkillGroupId, EnglishSkillGroupCopy>>;

export function getSkillsSectionContent(locale: Locale): SkillsSectionContent {
  return locale === 'en-US' ? englishSkillsSectionContent : skillsSectionContent;
}

export function getSkillLevelLabels(locale: Locale): Readonly<Record<SkillLevel, string>> {
  return locale === 'en-US' ? englishSkillLevelLabels : skillLevelLabels;
}

export function getSkillsUiCopy(locale: Locale): SkillsUiCopy {
  return skillsUiCopyByLocale[locale];
}

export function getSkillGroups(locale: Locale): readonly SkillGroup[] {
  if (locale === 'zh-CN') {
    return skillGroups;
  }

  return skillGroups.map((group) => {
    const copy: EnglishSkillGroupCopy = englishSkillGroupCopy[group.id];

    return {
      ...group,
      capabilities: copy.capabilities,
      description: copy.description,
      shortTitle: copy.shortTitle,
      skills: group.skills.map((skill) => ({
        ...skill,
        description: copy.skills[skill.id] ?? skill.description,
      })),
      title: copy.title,
    };
  });
}
