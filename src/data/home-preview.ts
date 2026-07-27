import type { Locale } from '@/types/i18n';

export type HomeServiceModeId = 'enterprise' | 'intelligence' | 'mvp';

export type HomeServiceMode = Readonly<{
  readonly contactService: 'ai' | 'enterprise' | 'full-stack';
  readonly description: string;
  readonly id: HomeServiceModeId;
  readonly number: string;
  readonly signals: readonly [string, string, string];
  readonly title: string;
}>;

export type HomePreviewCopy = Readonly<{
  readonly about: Readonly<{
    readonly detailAction: string;
    readonly railLabel: string;
    readonly shortDescription: string;
    readonly title: string;
  }>;
  readonly contactBrief: readonly [string, string, string];
  readonly ecosystem: Readonly<{
    readonly build: string;
    readonly connect: string;
    readonly write: string;
  }>;
  readonly process: Readonly<{
    readonly detailLabel: string;
    readonly pipelineLabel: string;
  }>;
  readonly services: Readonly<{
    readonly detailAction: string;
    readonly panelLabel: string;
    readonly title: string;
  }>;
}>;

const chineseHomeServiceModes = [
  {
    contactService: 'enterprise',
    description: '把分散的业务流程整理成清晰、可维护、可持续使用的内部系统。',
    id: 'enterprise',
    number: '01',
    signals: ['业务流程梳理', '权限与数据设计', '可上线的管理系统'],
    title: '企业系统',
  },
  {
    contactService: 'ai',
    description: '让知识库、智能问答与自动化能力进入真实的业务流程，而不止停留在演示。',
    id: 'intelligence',
    number: '02',
    signals: ['知识库与 RAG', 'AI 问答与 Agent', '自动化工作流'],
    title: 'AI 与自动化',
  },
  {
    contactService: 'full-stack',
    description: '从清晰的 MVP 开始，逐步完成关键功能、产品界面和后续迭代基础。',
    id: 'mvp',
    number: '03',
    signals: ['需求与范围确认', '前后端功能交付', '可继续迭代的版本'],
    title: '产品 MVP',
  },
] as const satisfies readonly HomeServiceMode[];

const englishHomeServiceModes = [
  {
    contactService: 'enterprise',
    description:
      'Turn scattered operations into a clear internal system that can be maintained and used over time.',
    id: 'enterprise',
    number: '01',
    signals: ['Workflow framing', 'Access and data design', 'A deployable operations system'],
    title: 'Enterprise systems',
  },
  {
    contactService: 'ai',
    description:
      'Bring knowledge, AI assistance and automation into an actual workflow rather than leaving them as a demo.',
    id: 'intelligence',
    number: '02',
    signals: ['Knowledge base and RAG', 'AI Q&A and agents', 'Automation workflows'],
    title: 'AI and automation',
  },
  {
    contactService: 'full-stack',
    description:
      'Start with a focused MVP, then build the essential capability, product interface and foundation for the next iteration.',
    id: 'mvp',
    number: '03',
    signals: ['Scope and priorities', 'Full-stack delivery', 'A version ready to evolve'],
    title: 'Product MVP',
  },
] as const satisfies readonly HomeServiceMode[];

const chineseHomePreviewCopy = {
  about: {
    detailAction: '查看完整介绍',
    railLabel: '能力演进',
    shortDescription: '从业务理解到产品交付，专注把复杂问题整理成可推进的软件方案。',
    title: '以产品视角完成每一次开发。',
  },
  contactBrief: ['明确目标', '确定范围', '开始构建'],
  ecosystem: {
    build: '持续构建',
    connect: '保持连接',
    write: '记录判断',
  },
  process: {
    detailLabel: '当前阶段',
    pipelineLabel: '项目交付流程',
  },
  services: {
    detailAction: '查看全部服务',
    panelLabel: '选择合作方式',
    title: '从一个方向开始，把它做成能用的产品。',
  },
} as const satisfies HomePreviewCopy;

const englishHomePreviewCopy = {
  about: {
    detailAction: 'See the full profile',
    railLabel: 'Capability path',
    shortDescription:
      'From understanding the business to shipping the product, I turn complex problems into a focused software path.',
    title: 'Building each product with a product mindset.',
  },
  contactBrief: ['Clarify the goal', 'Frame the scope', 'Start building'],
  ecosystem: {
    build: 'Keep building',
    connect: 'Stay connected',
    write: 'Share the thinking',
  },
  process: {
    detailLabel: 'Current stage',
    pipelineLabel: 'Product delivery process',
  },
  services: {
    detailAction: 'See all services',
    panelLabel: 'Choose a collaboration mode',
    title: 'Start with a focused direction and make it useful.',
  },
} as const satisfies HomePreviewCopy;

export function getHomeServiceModes(locale: Locale): readonly HomeServiceMode[] {
  return locale === 'en-US' ? englishHomeServiceModes : chineseHomeServiceModes;
}

export function getHomePreviewCopy(locale: Locale): HomePreviewCopy {
  return locale === 'en-US' ? englishHomePreviewCopy : chineseHomePreviewCopy;
}
