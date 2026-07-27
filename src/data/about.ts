import type {
  AboutMetric,
  AboutSectionContent,
  AboutStoryStep,
  AboutVisualModule,
} from '@/types/about';
import type { Locale } from '@/types/i18n';

export const aboutSectionContent = {
  closingLines: ['写代码是过程，', '解决问题才是目标。'],
  description: '我关注需求、产品、架构、体验与交付，让技术真正服务于用户和业务。',
  eyebrow: 'ABOUT',
  number: '02',
  statementDescription:
    '从需求分析、产品设计、系统架构，到前后端开发、AI 能力接入与部署上线，我希望把每一个想法变成真正可用的产品。',
  statementLines: ['我不仅编写功能，', '也关注产品是否真正解决问题。'],
  title: '不只是写代码，而是把问题变成可以运行的解决方案。',
} as const satisfies AboutSectionContent;

export const aboutStorySteps = [
  {
    id: 'backend',
    keywords: ['Java', 'Spring Boot', 'MySQL', '业务逻辑'],
    number: '01',
    summary: '学习后端开发、数据库、权限、业务流程与系统设计，逐渐理解企业软件如何支撑真实业务。',
    title: '从 Java 应用开发开始',
    visualLabel: '后端服务模块',
    visualMode: 'backend',
  },
  {
    id: 'fullstack',
    keywords: ['Vue', 'TypeScript', 'API 集成', '用户体验'],
    number: '02',
    summary: '开始使用 Vue 构建前端界面，让自己能够独立完成从接口到页面的完整交付。',
    title: '从后端走向完整产品',
    visualLabel: '前后端系统模块',
    visualMode: 'fullstack',
  },
  {
    id: 'automation',
    keywords: ['Python', 'FastAPI', '自动化', '数据处理'],
    number: '03',
    summary:
      '使用 Python 处理自动化、数据处理、Web 应用与效率工具，让开发能力不再局限于单一技术栈。',
    title: '通过 Python 扩展解决问题的方式',
    visualLabel: '自动化与数据模块',
    visualMode: 'automation',
  },
  {
    id: 'ai',
    keywords: ['RAG', 'LLM', 'Agent', '知识库'],
    number: '04',
    summary:
      '探索大模型、RAG、知识库、AI Agent 与业务系统结合，尝试把 AI 从演示功能变成真正有价值的产品能力。',
    title: '进入 AI 应用开发',
    visualLabel: 'AI 与知识系统模块',
    visualMode: 'ai',
  },
] as const satisfies readonly AboutStoryStep[];

export const aboutMetrics = [
  {
    description: 'Java · Python · Vue · AI',
    id: 'core-directions',
    label: '核心技术方向',
    numericValue: 4,
    value: '04',
  },
  {
    description: '需求 · 设计 · 开发 · 部署',
    id: 'full-cycle',
    label: '开发能力',
    value: '全流程',
  },
  {
    description: '管理系统 · 自动化 · AI 应用',
    id: 'project-coverage',
    label: '项目覆盖',
    value: '多类型',
  },
  {
    description: '不断更新技术与产品能力',
    id: 'continuous-learning',
    label: '学习与迭代',
    value: '持续',
  },
] as const satisfies readonly AboutMetric[];

export type AboutSectionCopy = Readonly<{
  readonly content: AboutSectionContent;
  readonly labels: Readonly<{
    readonly aboutLink: string;
    readonly metricsTitle: string;
    readonly mobileStoryIntro: string;
    readonly keywordsAria: string;
  }>;
  readonly metrics: readonly AboutMetric[];
  readonly storySteps: readonly AboutStoryStep[];
}>;

const englishAboutSectionCopy: AboutSectionCopy = {
  content: {
    closingLines: ['Writing code is the process.', 'Solving the right problem is the goal.'],
    description:
      'I connect requirements, product direction, architecture, experience and delivery so technology is useful to people and the business.',
    eyebrow: 'ABOUT',
    number: '02',
    statementDescription:
      'From discovery and product framing through system architecture, full-stack delivery, AI integration and deployment, I aim to turn each idea into something people can actually use.',
    statementLines: [
      'I do not only build features.',
      'I care whether the product solves the right problem.',
    ],
    title: 'More than code: turning a problem into a working solution.',
  },
  labels: {
    aboutLink: 'Learn more about how I work',
    keywordsAria: 'Related technologies and capabilities',
    metricsTitle: 'Turning capabilities into a dependable way of working.',
    mobileStoryIntro: 'BUILD / ITERATE / DEPLOY',
  },
  metrics: [
    {
      description: 'Java · Python · Vue · AI',
      id: 'core-directions',
      label: 'Core directions',
      numericValue: 4,
      value: '04',
    },
    {
      description: 'Discovery · design · build · deployment',
      id: 'full-cycle',
      label: 'Delivery scope',
      value: 'End to end',
    },
    {
      description: 'Business systems · automation · AI products',
      id: 'project-coverage',
      label: 'Project coverage',
      value: 'Multi-domain',
    },
    {
      description: 'Continually developing technical and product judgement',
      id: 'continuous-learning',
      label: 'Learning loop',
      value: 'Ongoing',
    },
  ],
  storySteps: [
    {
      id: 'backend',
      keywords: ['Java', 'Spring Boot', 'MySQL', 'Business logic'],
      number: '01',
      summary:
        'Started with backend development, data, permissions, business processes and system design to understand how enterprise software supports real operations.',
      title: 'Starting with Java application development',
      visualLabel: 'Backend service module',
      visualMode: 'backend',
    },
    {
      id: 'fullstack',
      keywords: ['Vue', 'TypeScript', 'API integration', 'Product experience'],
      number: '02',
      summary:
        'Moved into Vue interfaces to deliver complete product paths from APIs to usable screens.',
      title: 'Moving from backend work to a complete product',
      visualLabel: 'Full-stack system module',
      visualMode: 'fullstack',
    },
    {
      id: 'automation',
      keywords: ['Python', 'FastAPI', 'Automation', 'Data processing'],
      number: '03',
      summary:
        'Used Python for automation, data work, web applications and productivity tools, broadening the ways a problem can be solved.',
      title: 'Expanding the toolkit with Python',
      visualLabel: 'Automation and data module',
      visualMode: 'automation',
    },
    {
      id: 'ai',
      keywords: ['RAG', 'LLM', 'Agent', 'Knowledge systems'],
      number: '04',
      summary:
        'Exploring how LLMs, RAG, knowledge systems and agents can become valuable product capabilities rather than a visual demonstration.',
      title: 'Building AI applications with a business context',
      visualLabel: 'AI and knowledge module',
      visualMode: 'ai',
    },
  ],
};

const chineseAboutSectionCopy: AboutSectionCopy = {
  content: aboutSectionContent,
  labels: {
    aboutLink: '了解更多关于我',
    keywordsAria: '相关技术与能力',
    metricsTitle: '把能力变成可交付的工作方式。',
    mobileStoryIntro: 'BUILD / ITERATE / DEPLOY',
  },
  metrics: aboutMetrics,
  storySteps: aboutStorySteps,
};

export function getAboutSectionCopy(locale: Locale): AboutSectionCopy {
  return locale === 'en-US' ? englishAboutSectionCopy : chineseAboutSectionCopy;
}

export const aboutVisualModules = [
  {
    activeModes: ['backend', 'fullstack', 'automation', 'ai'],
    id: 'core',
    label: 'CORE',
    positions: {
      ai: { x: 0, y: 0 },
      automation: { x: 0, y: 0 },
      backend: { x: 0, y: 0 },
      fullstack: { x: 0, y: 0 },
    },
  },
  {
    activeModes: ['backend', 'fullstack', 'automation', 'ai'],
    id: 'api',
    label: 'API',
    positions: {
      ai: { x: -126, y: -118 },
      automation: { x: 128, y: -102 },
      backend: { x: -136, y: -104 },
      fullstack: { x: -126, y: -124 },
    },
  },
  {
    activeModes: ['backend', 'fullstack'],
    id: 'auth',
    label: 'AUTH',
    positions: {
      ai: { x: 130, y: -114 },
      automation: { x: -132, y: -112 },
      backend: { x: 132, y: -102 },
      fullstack: { x: 144, y: -116 },
    },
  },
  {
    activeModes: ['backend', 'fullstack', 'automation', 'ai'],
    id: 'data',
    label: 'DATA',
    positions: {
      ai: { x: -132, y: 104 },
      automation: { x: -128, y: 118 },
      backend: { x: -130, y: 114 },
      fullstack: { x: -146, y: 114 },
    },
  },
  {
    activeModes: ['fullstack'],
    id: 'ui',
    label: 'UI',
    positions: {
      ai: { x: 142, y: 108 },
      automation: { x: 142, y: 108 },
      backend: { x: 142, y: 108 },
      fullstack: { x: 146, y: 108 },
    },
  },
  {
    activeModes: ['automation'],
    id: 'auto',
    label: 'AUTO',
    positions: {
      ai: { x: 142, y: 110 },
      automation: { x: 144, y: 116 },
      backend: { x: -6, y: 150 },
      fullstack: { x: 4, y: 150 },
    },
  },
  {
    activeModes: ['ai'],
    id: 'rag',
    label: 'RAG',
    positions: {
      ai: { x: 132, y: -104 },
      automation: { x: -144, y: 108 },
      backend: { x: -144, y: 108 },
      fullstack: { x: -144, y: 108 },
    },
  },
  {
    activeModes: ['ai'],
    id: 'agent',
    label: 'AGENT',
    positions: {
      ai: { x: 142, y: 112 },
      automation: { x: 144, y: 108 },
      backend: { x: 144, y: 108 },
      fullstack: { x: 144, y: 108 },
    },
  },
] as const satisfies readonly AboutVisualModule[];
