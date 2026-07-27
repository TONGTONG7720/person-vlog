import type { ContactBudget, ContactSelectOption, ContactTimeline } from '@/types/contact';
import type { Locale } from '@/types/i18n';
import type { ServiceCategory } from '@/types/service';

export type ContactCopy = Readonly<{
  readonly cta: Readonly<{
    readonly description: string;
    readonly eyebrow: string;
    readonly primaryAction: string;
    readonly secondaryAction: string;
    readonly titleLines: readonly [string, string];
  }>;
  readonly failure: string;
  readonly form: Readonly<{
    readonly budget: string;
    readonly company: string;
    readonly email: string;
    readonly emailFallback: string;
    readonly heading: string;
    readonly helper: string;
    readonly honeypotLabel: string;
    readonly kicker: string;
    readonly legend: string;
    readonly message: string;
    readonly messagePlaceholder: string;
    readonly name: string;
    readonly optionalChoice: string;
    readonly service: string;
    readonly servicePlaceholder: string;
    readonly sending: string;
    readonly submit: string;
    readonly timeline: string;
  }>;
  readonly information: Readonly<{
    readonly contactTitle: string;
    readonly emptyContact: string;
    readonly introLines: readonly [string, string, string, string];
    readonly scenariosTitle: string;
  }>;
  readonly notesTitle: string;
  readonly page: Readonly<{
    readonly description: string;
    readonly eyebrow: string;
    readonly title: string;
  }>;
  readonly success: string;
}>;

export const contactCopy = {
  cta: {
    description: '无论是企业系统、AI 应用，还是一个需要验证的产品想法，都可以先从一次沟通开始。',
    eyebrow: "LET'S BUILD SOMETHING USEFUL.",
    primaryAction: '开始一个项目',
    secondaryAction: '查看项目',
    titleLines: ['有一个项目想法？', '让我们把它变成真正可运行的产品。'],
  },
  form: {
    budget: '预算范围',
    company: '公司 / 团队',
    email: '联系方式',
    emailFallback: '改用邮件联系',
    heading: '描述你的需求',
    helper: '预算仅用于理解沟通范围，不构成报价或交付承诺。',
    honeypotLabel: '请留空',
    kicker: 'PROJECT INQUIRY',
    legend: '项目咨询信息',
    message: '项目描述',
    messagePlaceholder: '简单描述你的项目目标、当前问题以及希望实现的功能。',
    name: '你的称呼',
    optionalChoice: '请选择（可选）',
    service: '项目类型',
    servicePlaceholder: '请选择项目类型',
    sending: '正在发送...',
    submit: '发送项目需求',
    timeline: '时间计划',
  },
  information: {
    contactTitle: '联系方式',
    emptyContact: '真实联系方式将在公开渠道配置后显示。',
    introLines: [
      '如果你正在规划一个系统、',
      '一个 AI 应用，',
      '或者只是有一个还没有确定方向的想法，',
      '欢迎先聊聊。',
    ],
    scenariosTitle: '适合先聊聊的情况',
  },
  notesTitle: '先把方向聊清楚。',
  page: {
    description: '描述你的目标、需求和当前情况，我会根据实际情况帮助你判断下一步方案。',
    eyebrow: 'CONTACT',
    title: '告诉我你的项目想法。',
  },
  success: '感谢你的留言。 我会尽快查看你的需求，并与你联系。',
  failure: '提交失败，请稍后重试。',
} as const satisfies ContactCopy;

export const contactServiceOptions = [
  { label: '企业系统开发', value: 'enterprise' },
  { label: 'AI 应用开发', value: 'ai' },
  { label: 'Python 自动化', value: 'automation' },
  { label: '前后端开发', value: 'full-stack' },
  { label: '系统维护', value: 'maintenance' },
  { label: '技术咨询', value: 'consulting' },
] as const satisfies readonly ContactSelectOption<ServiceCategory>[];

export const contactBudgetOptions = [
  { label: '暂未确定', value: 'undecided' },
  { label: '5千以内', value: 'under-5k' },
  { label: '5千-2万', value: 'five-to-twenty-k' },
  { label: '2万以上', value: 'over-twenty-k' },
  { label: '根据需求评估', value: 'scope-based' },
] as const satisfies readonly ContactSelectOption<ContactBudget>[];

export const contactTimelineOptions = [
  { label: '暂时了解', value: 'exploring' },
  { label: '近期启动', value: 'soon' },
  { label: '1-3个月', value: 'one-to-three-months' },
  { label: '3个月以上', value: 'over-three-months' },
] as const satisfies readonly ContactSelectOption<ContactTimeline>[];

export const contactSocialLinkIds = [
  'email',
  'github',
  'xiaohongshu',
  'douyin',
  'linkedin',
] as const;

export const contactCollaborationNotes = [
  '需要定制软件的企业',
  '希望开发 MVP 的团队',
  '想引入 AI 的业务',
  '需要技术支持的项目',
] as const;

export const contactFaqs = [
  {
    answer: '先进行需求沟通，确认目标和范围。',
    question: '如何开始？',
  },
  {
    answer: '可以根据项目情况进行维护、升级或功能扩展。',
    question: '是否支持已有项目？',
  },
  {
    answer: '不一定，可以先从 MVP 或单个功能开始。',
    question: '是否必须一次完成完整系统？',
  },
] as const;

export type ContactContent = Readonly<{
  readonly budgets: readonly ContactSelectOption<ContactBudget>[];
  readonly collaborationNotes: readonly string[];
  readonly copy: ContactCopy;
  readonly faqs: readonly Readonly<{ readonly answer: string; readonly question: string }>[];
  readonly services: readonly ContactSelectOption<ServiceCategory>[];
  readonly timelines: readonly ContactSelectOption<ContactTimeline>[];
}>;

const englishContactContent: ContactContent = {
  budgets: [
    { label: 'Not decided yet', value: 'undecided' },
    { label: 'Under CNY 5,000', value: 'under-5k' },
    { label: 'CNY 5,000–20,000', value: 'five-to-twenty-k' },
    { label: 'Over CNY 20,000', value: 'over-twenty-k' },
    { label: 'Scope-based estimate', value: 'scope-based' },
  ],
  collaborationNotes: [
    'Businesses planning tailored software',
    'Teams validating an MVP',
    'Operations introducing AI',
    'Products that need focused technical support',
  ],
  copy: {
    cta: {
      description:
        'Whether you are planning an operations system, an AI application or an idea that needs validation, a focused conversation is a good first step.',
      eyebrow: "LET'S BUILD SOMETHING USEFUL.",
      primaryAction: 'Start a project conversation',
      secondaryAction: 'View projects',
      titleLines: ['Have a product idea?', 'Let’s turn it into software that works.'],
    },
    failure: 'The message could not be sent. Please try again shortly.',
    form: {
      budget: 'Budget range',
      company: 'Company or team',
      email: 'Email address',
      emailFallback: 'Use email instead',
      heading: 'Tell me what you need',
      helper:
        'The budget field only helps frame the conversation; it is not a quote or delivery commitment.',
      honeypotLabel: 'Leave this field empty',
      kicker: 'PROJECT INQUIRY',
      legend: 'Project inquiry details',
      message: 'Project details',
      messagePlaceholder:
        'Briefly describe the outcome, current constraint and the capability you want to create.',
      name: 'Your name',
      optionalChoice: 'Select one (optional)',
      service: 'Project type',
      servicePlaceholder: 'Select a project type',
      sending: 'Sending…',
      submit: 'Send project details',
      timeline: 'Expected timeline',
    },
    information: {
      contactTitle: 'Contact channels',
      emptyContact: 'Public contact channels will appear here once they are configured.',
      introLines: [
        'If you are planning a system,',
        'an AI application,',
        'or an idea that still needs a clear direction,',
        'a focused conversation is a good first step.',
      ],
      scenariosTitle: 'Good reasons to start a conversation',
    },
    notesTitle: 'Start by making the direction clear.',
    page: {
      description:
        'Share your goal, constraints and current situation. I will help you assess a practical next direction.',
      eyebrow: 'CONTACT',
      title: 'Tell me about the product you want to build.',
    },
    success: 'Thank you for reaching out. I will review the details and get back to you soon.',
  },
  faqs: [
    {
      answer: 'We start by clarifying the goal, constraints and scope.',
      question: 'How do we begin?',
    },
    {
      answer:
        'Yes. Existing products can be assessed for maintenance, upgrades or focused features.',
      question: 'Can you work with an existing product?',
    },
    {
      answer:
        'No. A focused MVP or one well-defined capability is often the better first delivery.',
      question: 'Do we need to build a full system at once?',
    },
  ],
  services: [
    { label: 'Enterprise software development', value: 'enterprise' },
    { label: 'AI application development', value: 'ai' },
    { label: 'Python automation', value: 'automation' },
    { label: 'Full-stack product development', value: 'full-stack' },
    { label: 'System maintenance', value: 'maintenance' },
    { label: 'Product and technical consulting', value: 'consulting' },
  ],
  timelines: [
    { label: 'Exploring options', value: 'exploring' },
    { label: 'Starting soon', value: 'soon' },
    { label: 'Within 1–3 months', value: 'one-to-three-months' },
    { label: 'More than 3 months', value: 'over-three-months' },
  ],
};

const chineseContactContent: ContactContent = {
  budgets: contactBudgetOptions,
  collaborationNotes: contactCollaborationNotes,
  copy: contactCopy,
  faqs: contactFaqs,
  services: contactServiceOptions,
  timelines: contactTimelineOptions,
};

export function getContactContent(locale: Locale): ContactContent {
  return locale === 'en-US' ? englishContactContent : chineseContactContent;
}
