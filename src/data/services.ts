import { getLocalizedRecord, type LocalizedOverrides } from '@/i18n/content';
import type { Locale } from '@/types/i18n';
import type { Service, ServiceEngagement, ServicesSectionContent } from '@/types/service';

export const servicesSectionContent = {
  closingAction: '告诉我你的项目想法',
  closingHelper: '我会先帮助确认需求和可行方案。',
  closingLines: [
    '不是每一个需求都需要开发一个庞大的系统。',
    '有时，一个清晰的功能、一个自动化流程，或者一个可以验证想法的 MVP，就是更合适的开始。',
  ],
  description:
    '我可以参与需求分析、产品方案、系统设计、前后端开发、AI 能力集成、部署上线和后续维护，也可以根据项目情况承担其中一个独立环节。',
  eyebrow: 'SERVICES',
  engagementTitle: ['可以从完整项目开始，', '也可以先完成一个清晰的小范围版本。'],
  introDetail:
    '我会先帮助确认目标、范围和优先级，再根据实际情况决定采用完整项目开发、独立模块开发，还是先完成一个可验证的 MVP。',
  introLines: ['你可以带着一个完整需求来，', '也可以只有一个还不够清晰的想法。'],
  number: '05',
  technologyNote: '实际技术方案将根据业务需求、已有系统和交付目标确定。',
  title: '从一个想法，到可以真正投入使用的软件产品。',
} as const satisfies ServicesSectionContent;

export const serviceEngagements = [
  {
    description: '从需求、方案、开发到部署的完整交付。',
    number: '01',
    title: '完整项目',
  },
  {
    description: '只开发后端、前端、AI 或自动化中的一个部分。',
    number: '02',
    title: '独立模块',
  },
  {
    description: '先完成最小可用版本，用于测试需求与产品方向。',
    number: '03',
    title: 'MVP 验证',
  },
] as const satisfies readonly ServiceEngagement[];

export type ServicesSectionCopy = Readonly<{
  readonly content: ServicesSectionContent;
  readonly engagements: readonly ServiceEngagement[];
  readonly labels: Readonly<{
    readonly actionAriaPrefix: string;
    readonly active: string;
    readonly considerations: string;
    readonly deliverables: string;
    readonly detail: string;
    readonly listAria: string;
    readonly problems: string;
    readonly suitableFor: string;
    readonly technologyApproach: string;
  }>;
}>;

const englishServicesSectionCopy: ServicesSectionCopy = {
  content: {
    closingAction: 'Tell me about your project',
    closingHelper: 'We can start by clarifying the need and a feasible path.',
    closingLines: [
      'Not every need calls for a large system.',
      'Sometimes a focused feature, an automation or a testable MVP is the better place to begin.',
    ],
    description:
      'I can support discovery, product direction, system design, frontend and backend delivery, AI integration, deployment and maintenance — or take ownership of one well-defined part.',
    eyebrow: 'SERVICES',
    engagementTitle: [
      'Start with a complete product,',
      'or begin with one clear, focused version.',
    ],
    introDetail:
      'We begin by clarifying the outcome, scope and priority, then choose a complete delivery, a focused module or a testable MVP that fits the situation.',
    introLines: ['Bring a complete brief,', 'or start with an idea that is still taking shape.'],
    number: '05',
    technologyNote:
      'The final technical approach is chosen from the business context, existing systems and delivery goal.',
    title: 'From an idea to software people can genuinely use.',
  },
  engagements: [
    {
      description: 'From discovery and design through implementation and deployment.',
      number: '01',
      title: 'End-to-end product',
    },
    {
      description: 'A focused backend, frontend, AI or automation stream.',
      number: '02',
      title: 'Focused module',
    },
    {
      description: 'A small usable version to test a need and product direction.',
      number: '03',
      title: 'MVP validation',
    },
  ],
  labels: {
    actionAriaPrefix: 'Discuss',
    active: 'Selected service',
    considerations: 'Important considerations',
    deliverables: 'Key deliverables',
    detail: 'View details',
    listAria: 'Available development services',
    problems: 'Problems this can solve',
    suitableFor: 'A good fit when you need',
    technologyApproach: 'Typical technical approach',
  },
};

const chineseServicesSectionCopy: ServicesSectionCopy = {
  content: servicesSectionContent,
  engagements: serviceEngagements,
  labels: {
    actionAriaPrefix: '咨询',
    active: '当前服务',
    considerations: '使用说明',
    deliverables: '主要交付',
    detail: '查看详情',
    listAria: '可咨询的开发服务',
    problems: '可以帮助解决',
    suitableFor: '适合你，如果',
    technologyApproach: '常用技术方案',
  },
};

export function getServicesSectionCopy(locale: Locale): ServicesSectionCopy {
  return locale === 'en-US' ? englishServicesSectionCopy : chineseServicesSectionCopy;
}

export const services = [
  {
    accent: 'blue',
    action: { href: '/contact?service=enterprise', label: '咨询这个服务' },
    category: 'enterprise',
    deliverables: [
      '需求梳理',
      '产品功能方案',
      '后台管理系统',
      '业务接口',
      '数据库设计',
      '权限体系',
      '部署文档',
    ],
    description:
      '根据企业实际业务流程，开发订单、库存、客户、员工、财务、审批、报表和权限等管理功能。',
    eyebrow: 'ENTERPRISE SYSTEMS',
    featured: true,
    featuredOrder: 1,
    id: 'enterprise-system',
    number: '01',
    problems: [
      '业务数据分散',
      '人工处理效率低',
      '权限管理混乱',
      '流程缺乏统一',
      '经营数据难以统计',
    ],
    shortDescription: '把分散的业务流程整理为清晰、可维护的内部系统。',
    slug: 'enterprise-system-development',
    suitableFor: [
      '需要将线下流程数字化的中小企业',
      '使用表格或多个软件管理业务的团队',
      '需要定制内部管理平台的企业',
    ],
    technologies: ['Java', 'Spring Boot', 'Vue 3', 'TypeScript', 'MySQL', 'Redis', 'Docker'],
    title: '企业管理系统开发',
  },
  {
    accent: 'purple',
    action: { href: '/contact?service=ai', label: '咨询这个服务' },
    category: 'ai',
    considerations: [
      'AI 输出仍需要结合业务规则和人工判断进行验证。',
      'RAG 可以降低错误风险，但不能完全消除不准确回答。',
      '实际效果取决于数据质量、业务场景与后续运营方式。',
    ],
    deliverables: [
      'AI 产品方案',
      '模型接入',
      '知识库与 RAG 检索',
      '提示词配置',
      '会话系统',
      '权限控制',
      '答案引用',
    ],
    description:
      '将大模型、知识库、RAG 和 Agent 能力接入具体业务，开发真正可以使用的智能问答、知识助手和自动化工作流。',
    eyebrow: 'AI PRODUCTS',
    featured: true,
    featuredOrder: 2,
    id: 'ai-products',
    number: '02',
    problems: [
      '内部资料难以查询',
      '重复问题消耗人工时间',
      '普通大模型缺少业务知识',
      '多个 AI 工具无法统一管理',
    ],
    shortDescription: '把大模型能力接入可验证、可持续迭代的业务流程。',
    slug: 'ai-application-development',
    suitableFor: [
      '希望将 AI 引入现有业务的企业',
      '需要内部知识助手的团队',
      '希望开发 AI 产品原型的创业者',
      '拥有大量文档和知识资料的组织',
    ],
    technologies: [
      'Python',
      'FastAPI',
      'OpenAI API',
      'RAG',
      'Vector Database',
      'PostgreSQL',
      'Vue 3',
    ],
    title: 'AI 应用开发',
  },
  {
    accent: 'cyan',
    action: { href: '/contact?service=automation', label: '咨询这个服务' },
    category: 'automation',
    deliverables: [
      '自动化脚本或工具',
      '数据处理流程',
      '接口集成',
      '定时任务',
      '日志记录',
      '异常处理',
      '使用说明',
    ],
    description:
      '通过 Python 将重复的数据处理、文件整理、接口调用、报表生成和业务操作转化为自动化流程。',
    eyebrow: 'AUTOMATION',
    featured: true,
    featuredOrder: 3,
    id: 'python-automation',
    number: '03',
    problems: [
      '重复操作耗时',
      '文件处理容易出错',
      '数据整理流程不统一',
      '多个平台之间无法自动流转',
      '人工生成报表效率低',
    ],
    shortDescription: '把重复、易错的日常操作转化为可追踪的自动化流程。',
    slug: 'python-automation-tools',
    suitableFor: [
      '存在大量重复人工操作的团队',
      '需要批量处理文件或数据的个人和企业',
      '需要连接多个系统接口的业务',
      '希望提高日常工作效率的团队',
    ],
    technologies: ['Python', 'FastAPI', 'Pandas', 'Scheduled Tasks', 'REST API', 'Docker'],
    title: 'Python 自动化工具',
  },
  {
    accent: 'neutral',
    action: { href: '/contact?service=full-stack', label: '咨询这个服务' },
    category: 'full-stack',
    deliverables: [
      '需求确认',
      '功能模块',
      '接口文档',
      '前端页面',
      '权限接入',
      '联调测试',
      '部署协助',
    ],
    description:
      '为现有项目开发新的业务模块、接口、管理页面或交互功能，也可以单独承担后端或前端部分。',
    eyebrow: 'FULL-STACK DEVELOPMENT',
    featured: true,
    featuredOrder: 4,
    id: 'full-stack-development',
    number: '04',
    problems: [
      '开发进度不足',
      '旧功能难以扩展',
      '前后端接口不统一',
      '页面体验较差',
      '项目缺少关键模块',
    ],
    shortDescription: '为已有产品补齐关键功能，或把 MVP 做成可继续迭代的版本。',
    slug: 'full-stack-development',
    suitableFor: [
      '已有项目但缺少开发人员的团队',
      '需要快速补充某个功能模块的企业',
      '需要重构接口或页面的项目',
      '希望完成产品 MVP 的创业团队',
    ],
    technologies: ['Spring Boot', 'FastAPI', 'Vue 3', 'React', 'Next.js', 'TypeScript', 'MySQL'],
    title: '前后端功能开发',
  },
  {
    accent: 'blue',
    action: { href: '/contact?service=maintenance', label: '咨询这个服务' },
    category: 'maintenance',
    considerations: [
      '升级或修复需要先结合现有代码、部署环境和需求范围进行评估，再确认可行方案与交付边界。',
    ],
    deliverables: [
      '代码审查',
      '问题排查',
      '缺陷修复',
      '性能优化',
      '功能升级',
      '部署优化',
      '维护记录',
    ],
    description:
      '对已有系统进行功能升级、缺陷修复、性能优化、部署调整和代码维护，帮助项目继续稳定运行和扩展。',
    eyebrow: 'MAINTENANCE',
    featured: true,
    featuredOrder: 5,
    id: 'system-maintenance',
    number: '05',
    problems: [
      '系统报错频繁',
      '代码难以维护',
      '接口性能较差',
      '部署流程不稳定',
      '旧功能无法适应新业务',
    ],
    shortDescription: '在理解现有系统边界后，逐步改善稳定性、性能与可维护性。',
    slug: 'system-upgrade-and-maintenance',
    suitableFor: [
      '已有系统需要长期维护的企业',
      '原开发人员无法继续支持的项目',
      '需要升级技术栈或部署环境的团队',
      '存在性能和稳定性问题的系统',
    ],
    technologies: ['根据现有项目的语言、框架、部署环境与业务目标确定'],
    title: '系统升级与维护',
  },
  {
    accent: 'purple',
    action: { href: '/contact?service=consulting', label: '咨询这个服务' },
    category: 'consulting',
    considerations: ['先确认问题，再决定是否需要开发。'],
    deliverables: [
      '需求分析',
      '功能清单',
      '用户流程',
      '产品方案',
      '技术架构',
      '开发计划',
      'MVP 范围',
    ],
    description:
      '在正式开发前，帮助梳理需求、功能范围、技术选型、系统架构、开发优先级和 MVP 方案。',
    eyebrow: 'PRODUCT & TECHNICAL CONSULTING',
    featured: true,
    featuredOrder: 6,
    id: 'product-and-technical-consulting',
    number: '06',
    problems: [
      '需求不清晰',
      '功能范围不断扩大',
      '技术栈选择困难',
      '不知道如何规划 MVP',
      '缺少完整开发路线',
    ],
    shortDescription: '先把问题、范围和优先级讲清楚，再决定最合适的下一步。',
    slug: 'product-and-technical-consulting',
    suitableFor: [
      '只有初步想法但不知道如何落地的个人',
      '需要评估开发成本的创业团队',
      '准备启动新系统的企业',
      '需要选择技术方案的项目负责人',
    ],
    technologies: ['根据业务需求、已有系统和交付目标确定'],
    title: '技术咨询与产品方案',
  },
] as const satisfies readonly Service[];

const serviceCopyBySlug = {
  'ai-application-development': {
    'en-US': {
      action: { href: '/contact?service=ai', label: 'Discuss this service' },
      considerations: [
        'AI output still needs validation through business rules and human judgement.',
        'RAG lowers the risk of unsupported answers; it cannot eliminate inaccuracy on its own.',
        'Results depend on data quality, the use case and the operating model after launch.',
      ],
      deliverables: [
        'AI product direction',
        'Model integration',
        'Knowledge base and RAG retrieval',
        'Prompt configuration',
        'Conversation experience',
        'Access control',
        'Answer citations',
      ],
      description:
        'Brings LLMs, knowledge bases, RAG and agent capabilities into real workflows to build usable assistants, knowledge tools and automations.',
      eyebrow: 'AI PRODUCTS',
      problems: [
        'Internal material is difficult to search',
        'Repeated questions consume expert time',
        'Generic models lack business context',
        'Multiple AI tools are difficult to govern together',
      ],
      shortDescription:
        'Turn model capabilities into verifiable business workflows that can improve over time.',
      suitableFor: [
        'Teams introducing AI into an existing business',
        'Organizations that need an internal knowledge assistant',
        'Founders validating an AI product prototype',
        'Organizations with a substantial document base',
      ],
      title: 'AI Application Development',
    },
  },
  'enterprise-system-development': {
    'en-US': {
      action: { href: '/contact?service=enterprise', label: 'Discuss this service' },
      deliverables: [
        'Requirements discovery',
        'Product feature plan',
        'Operations interface',
        'Business APIs',
        'Database design',
        'Permission model',
        'Deployment documentation',
      ],
      description:
        'Designs and builds management functions for orders, inventory, customers, staff, finance, approvals, reporting and permissions around real business workflows.',
      eyebrow: 'ENTERPRISE SYSTEMS',
      problems: [
        'Business data is scattered',
        'Manual processing is slow',
        'Permission management is unclear',
        'Workflows lack a shared system',
        'Operating data is difficult to analyze',
      ],
      shortDescription:
        'Turn fragmented business workflows into a clear, maintainable internal system.',
      suitableFor: [
        'Small and mid-sized teams digitizing offline processes',
        'Teams running operations across spreadsheets or disconnected tools',
        'Organizations that need a tailored internal platform',
      ],
      title: 'Enterprise Software Development',
    },
  },
  'full-stack-development': {
    'en-US': {
      action: { href: '/contact?service=full-stack', label: 'Discuss this service' },
      deliverables: [
        'Scope confirmation',
        'Feature modules',
        'API documentation',
        'Frontend interfaces',
        'Permission integration',
        'Integration testing',
        'Deployment support',
      ],
      description:
        'Builds business modules, APIs, operations interfaces and interactions for existing products, or owns a focused backend or frontend delivery stream.',
      eyebrow: 'FULL-STACK DEVELOPMENT',
      problems: [
        'Delivery capacity is limited',
        'Legacy features are difficult to extend',
        'Frontend and backend APIs are inconsistent',
        'The interface experience needs improvement',
        'A critical product module is missing',
      ],
      shortDescription:
        'Complete an important product capability or turn an MVP into a version ready for the next iteration.',
      suitableFor: [
        'Teams with an existing product but limited development capacity',
        'Companies that need to add a focused feature quickly',
        'Projects that need API or interface reconstruction',
        'Startup teams building a usable MVP',
      ],
      title: 'Full-Stack Product Development',
    },
  },
  'product-and-technical-consulting': {
    'en-US': {
      action: { href: '/contact?service=consulting', label: 'Discuss this service' },
      considerations: ['Clarify the problem before deciding whether new software is needed.'],
      deliverables: [
        'Requirements analysis',
        'Feature inventory',
        'User flows',
        'Product direction',
        'Technical architecture',
        'Delivery plan',
        'MVP scope',
      ],
      description:
        'Before implementation starts, clarify the requirements, feature boundaries, technical choices, architecture, delivery priorities and MVP approach.',
      eyebrow: 'PRODUCT & TECHNICAL CONSULTING',
      problems: [
        'Requirements are still ambiguous',
        'Feature scope keeps expanding',
        'Technology selection is difficult',
        'The MVP is hard to define',
        'There is no complete delivery path',
      ],
      shortDescription:
        'Make the problem, scope and priorities clear before choosing the best next move.',
      suitableFor: [
        'Individuals with an early idea who need a delivery path',
        'Startup teams estimating software cost and scope',
        'Businesses preparing to launch a new system',
        'Product owners choosing a technical approach',
      ],
      title: 'Product and Technical Consulting',
    },
  },
  'python-automation-tools': {
    'en-US': {
      action: { href: '/contact?service=automation', label: 'Discuss this service' },
      deliverables: [
        'Automation scripts or tools',
        'Data processing flow',
        'API integration',
        'Scheduled jobs',
        'Logging',
        'Error handling',
        'Usage guide',
      ],
      description:
        'Uses Python to turn repetitive data processing, file work, API calls, report generation and business operations into reliable automated workflows.',
      eyebrow: 'AUTOMATION',
      problems: [
        'Repeated work consumes time',
        'File processing is error-prone',
        'Data workflows are inconsistent',
        'Systems cannot hand work off automatically',
        'Manual reporting is inefficient',
      ],
      shortDescription: 'Turn repetitive, error-prone work into observable automated workflows.',
      suitableFor: [
        'Teams with a large volume of repeated manual work',
        'People and organizations processing files or data in batches',
        'Operations that need to connect multiple system APIs',
        'Teams improving day-to-day productivity',
      ],
      title: 'Python Automation Solutions',
    },
  },
  'system-upgrade-and-maintenance': {
    'en-US': {
      action: { href: '/contact?service=maintenance', label: 'Discuss this service' },
      considerations: [
        'Upgrades and fixes start with an assessment of the codebase, deployment environment and scope before delivery boundaries are agreed.',
      ],
      deliverables: [
        'Code review',
        'Issue investigation',
        'Defect fixes',
        'Performance improvements',
        'Feature upgrades',
        'Deployment improvements',
        'Maintenance record',
      ],
      description:
        'Improves existing systems through feature upgrades, defect fixes, performance work, deployment adjustments and ongoing code maintenance.',
      eyebrow: 'MAINTENANCE',
      problems: [
        'The system fails frequently',
        'The codebase is difficult to maintain',
        'API performance is slow',
        'Deployment is unreliable',
        'Legacy features no longer fit the business',
      ],
      shortDescription:
        'Improve stability, performance and maintainability after understanding the current system boundaries.',
      suitableFor: [
        'Businesses maintaining an existing system long term',
        'Projects whose original developer is no longer available',
        'Teams upgrading their stack or deployment environment',
        'Systems with performance or reliability concerns',
      ],
      title: 'System Upgrade and Maintenance',
    },
  },
} as const satisfies Readonly<Record<string, LocalizedOverrides<Service>>>;

export function getLocalizedServices(locale: Locale): readonly Service[] {
  return services.map((service) =>
    getLocalizedRecord<Service>(service, locale, serviceCopyBySlug[service.slug]),
  );
}

export function getLocalizedServiceBySlug(slug: string, locale: Locale): Service | undefined {
  return getLocalizedServices(locale).find((service) => service.slug === slug);
}

export const featuredServices = services
  .filter((service) => service.featured)
  .sort((first, second) => first.featuredOrder - second.featuredOrder);

export const defaultFeaturedServiceId = 'enterprise-system';
