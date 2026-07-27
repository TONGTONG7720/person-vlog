import type {
  ProcessSectionContent,
  ProcessStep,
  ProcessVisualLayer,
  ProcessVisualState,
} from '@/types/process';
import type { Locale } from '@/types/i18n';

export const processSectionContent = {
  closingAction: '开始讨论你的项目',
  closingHelper: '先从一次清晰的需求沟通开始。',
  closingLines: [
    '清晰的流程，',
    '不是为了增加步骤，',
    '而是为了降低沟通成本，',
    '让项目更稳定地推进。',
  ],
  description:
    '从需求理解、方案设计，到开发测试和上线维护，每一步都围绕目标、范围和最终使用体验展开。',
  eyebrow: 'PROCESS',
  introDescription: '不同项目规模不同，但清晰的问题定义和开发流程，始终是高质量结果的基础。',
  introLines: ['从想法到上线，', '每一步都有明确目标。'],
  number: '06',
  title: '好的项目，始于清晰的问题定义。',
  visualFooter: 'IDEA / STRUCTURE / SYSTEM / BUILD / LIVE',
  visualTitle: 'PRODUCT BUILD SYSTEM',
} as const satisfies ProcessSectionContent;

const englishProcessSectionContent = {
  closingAction: 'Start a project conversation',
  closingHelper: 'It starts with a clear conversation about the need.',
  closingLines: [
    'A clear process',
    'does not add unnecessary steps.',
    'It reduces communication overhead',
    'and helps a project move forward with confidence.',
  ],
  description:
    'From understanding the need and designing a solution to development, testing and launch, every step stays anchored to goals, scope and the final user experience.',
  eyebrow: 'PROCESS',
  introDescription:
    'Every project has a different scale, but a clear problem definition and delivery process are the foundation of a high-quality result.',
  introLines: ['From an idea to launch,', 'each step has a clear goal.'],
  number: '06',
  title: 'Good projects begin with a clearly defined problem.',
  visualFooter: 'IDEA / STRUCTURE / SYSTEM / BUILD / LIVE',
  visualTitle: 'PRODUCT BUILD SYSTEM',
} as const satisfies ProcessSectionContent;

export type ProcessUiCopy = Readonly<{
  readonly deliverables: string;
  readonly focus: string;
  readonly stepsAriaLabel: string;
}>;

const processUiCopyByLocale = {
  'en-US': {
    deliverables: 'What you receive',
    focus: 'Focus',
    stepsAriaLabel: 'Five-step development process',
  },
  'zh-CN': {
    deliverables: '本阶段交付',
    focus: '重点',
    stepsAriaLabel: '五阶段开发流程',
  },
} as const satisfies Readonly<Record<Locale, ProcessUiCopy>>;

export const processSteps = [
  {
    deliverables: ['需求整理', '功能范围', '初步方案'],
    description: '理解你的业务目标、用户需求和当前遇到的问题，明确真正需要解决的核心方向。',
    eyebrow: 'DISCOVERY',
    focus: ['业务背景', '用户角色', '当前流程', '目标结果', '功能边界'],
    id: 'idea',
    number: '01',
    title: '需求沟通',
    visualState: 'idea',
  },
  {
    deliverables: ['功能清单', '产品结构', '开发规划'],
    description: '将想法整理成清晰的产品结构，确定功能优先级、页面流程和 MVP 范围。',
    eyebrow: 'PLANNING',
    focus: ['功能拆解', '用户流程', '页面规划', '优先级排序', '风险分析'],
    id: 'structure',
    number: '02',
    title: '产品方案',
    visualState: 'structure',
  },
  {
    deliverables: ['UI 方案', '接口设计', '技术方案'],
    description: '根据产品需求确定界面结构、技术方案和系统架构，让开发过程更加稳定和可维护。',
    eyebrow: 'DESIGN SYSTEM',
    focus: ['页面设计', '数据结构', 'API 规划', '技术选型', '系统架构'],
    id: 'design',
    number: '03',
    title: 'UI 与技术设计',
    visualState: 'design',
  },
  {
    deliverables: ['可运行版本', '测试结果', '源码'],
    description: '按照确定方案进行开发，持续验证功能、体验和系统稳定性。',
    eyebrow: 'BUILD',
    focus: ['前后端开发', '功能实现', '联调测试', 'Bug 修复', '性能优化'],
    id: 'development',
    number: '04',
    title: '开发与测试',
    visualState: 'development',
  },
  {
    deliverables: ['部署支持', '使用说明', '维护建议'],
    description: '帮助项目进入实际运行阶段，并根据后续需求持续优化。',
    eyebrow: 'DEPLOY',
    focus: ['环境部署', '数据配置', '上线检查', '问题处理', '后续迭代'],
    id: 'deployment',
    number: '05',
    title: '部署与维护',
    visualState: 'deployment',
  },
] as const satisfies readonly ProcessStep[];

export const processVisualLayers = [
  {
    code: 'IDEA',
    label: '问题定义',
    modules: ['需求', '用户', '目标', '问题'],
    visualState: 'idea',
  },
  {
    code: 'STRUCTURE',
    label: '范围与流程',
    modules: ['功能', '流程', '优先级'],
    visualState: 'structure',
  },
  {
    code: 'SYSTEM',
    label: '界面与技术',
    modules: ['UI', 'API', 'DATABASE', 'ARCHITECTURE'],
    visualState: 'design',
  },
  {
    code: 'BUILD',
    label: '开发与验证',
    modules: ['FRONTEND', 'BACKEND', 'TESTING'],
    visualState: 'development',
  },
  {
    code: 'LIVE',
    label: '上线与迭代',
    modules: ['SERVER', 'CLOUD', 'MONITOR'],
    visualState: 'deployment',
  },
] as const satisfies readonly ProcessVisualLayer[];

type EnglishProcessStepCopy = Readonly<{
  readonly deliverables: readonly string[];
  readonly description: string;
  readonly focus: readonly string[];
  readonly title: string;
}>;

const englishProcessStepCopy = {
  deployment: {
    deliverables: ['Deployment support', 'Usage guide', 'Maintenance recommendations'],
    description:
      'I help the product enter real operation and keep improving it as new needs emerge.',
    focus: [
      'Environment deployment',
      'Data configuration',
      'Launch checks',
      'Issue handling',
      'Future iterations',
    ],
    title: 'Deployment and maintenance',
  },
  design: {
    deliverables: ['UI direction', 'API design', 'Technical plan'],
    description:
      'The interface, technical approach and system architecture are defined from the product needs so delivery stays stable and maintainable.',
    focus: [
      'Interface design',
      'Data structure',
      'API planning',
      'Technology choices',
      'System architecture',
    ],
    title: 'UI and technical design',
  },
  development: {
    deliverables: ['Working version', 'Test results', 'Source code'],
    description:
      'The agreed solution is built while function, experience and system stability are continuously verified.',
    focus: [
      'Frontend and backend',
      'Feature implementation',
      'Integration testing',
      'Bug fixes',
      'Performance work',
    ],
    title: 'Development and testing',
  },
  idea: {
    deliverables: ['Requirements summary', 'Feature scope', 'Initial proposal'],
    description:
      'We clarify business goals, user needs and the current problem so the work stays centered on what truly needs to be solved.',
    focus: [
      'Business context',
      'User roles',
      'Current workflow',
      'Target outcome',
      'Scope boundaries',
    ],
    title: 'Discovery',
  },
  structure: {
    deliverables: ['Feature list', 'Product structure', 'Delivery plan'],
    description:
      'The idea is shaped into a clear product structure with feature priorities, user flows and an MVP boundary.',
    focus: [
      'Feature breakdown',
      'User journeys',
      'Page planning',
      'Priority order',
      'Risk analysis',
    ],
    title: 'Product planning',
  },
} as const satisfies Readonly<Record<ProcessVisualState, EnglishProcessStepCopy>>;

const englishProcessVisualLayerCopy = {
  deployment: { label: 'Launch and iteration', modules: ['SERVER', 'CLOUD', 'MONITOR'] },
  design: { label: 'Interface and technology', modules: ['UI', 'API', 'DATABASE', 'ARCHITECTURE'] },
  development: { label: 'Build and validation', modules: ['FRONTEND', 'BACKEND', 'TESTING'] },
  idea: { label: 'Problem definition', modules: ['REQUIREMENTS', 'USERS', 'GOALS', 'PROBLEM'] },
  structure: { label: 'Scope and flow', modules: ['FEATURES', 'FLOW', 'PRIORITY'] },
} as const satisfies Readonly<
  Record<
    ProcessVisualState,
    Readonly<{ readonly label: string; readonly modules: readonly string[] }>
  >
>;

export function getProcessSectionContent(locale: Locale): ProcessSectionContent {
  return locale === 'en-US' ? englishProcessSectionContent : processSectionContent;
}

export function getProcessUiCopy(locale: Locale): ProcessUiCopy {
  return processUiCopyByLocale[locale];
}

export function getProcessSteps(locale: Locale): readonly ProcessStep[] {
  if (locale === 'zh-CN') {
    return processSteps;
  }

  return processSteps.map((step) => ({
    ...step,
    ...englishProcessStepCopy[step.id],
  }));
}

export function getProcessVisualLayers(locale: Locale): readonly ProcessVisualLayer[] {
  if (locale === 'zh-CN') {
    return processVisualLayers;
  }

  return processVisualLayers.map((layer) => ({
    ...layer,
    ...englishProcessVisualLayerCopy[layer.visualState],
  }));
}
