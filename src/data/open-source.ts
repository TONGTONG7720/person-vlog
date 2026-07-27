import type { EcosystemSectionContent, OpenSourceProject } from '@/types/open-source';
import type { Locale } from '@/types/i18n';

export const openSourceProjects = [] as const satisfies readonly OpenSourceProject[];

export type EcosystemUiCopy = Readonly<{
  readonly githubLabelsAria: string;
  readonly technologiesAria: string;
  readonly topicsSuffix: string;
  readonly viewGithub: string;
}>;

const ecosystemUiCopyByLocale = {
  'en-US': {
    githubLabelsAria: 'GitHub content directions',
    technologiesAria: 'Primary technologies',
    topicsSuffix: 'topics',
    viewGithub: 'View GitHub',
  },
  'zh-CN': {
    githubLabelsAria: 'GitHub 内容方向',
    technologiesAria: '主要技术方向',
    topicsSuffix: '主题',
    viewGithub: '查看 GitHub',
  },
} as const satisfies Readonly<Record<Locale, EcosystemUiCopy>>;

export const ecosystemSectionContent = {
  number: '08',
  eyebrow: 'ECOSYSTEM',
  titleLines: ['持续构建，', '持续分享，', '持续沉淀。'],
  descriptionLines: [
    '通过项目、代码和技术文章，',
    '记录自己的学习过程，也让更多人了解我的开发方向。',
  ],
  githubTitle: 'GitHub',
  githubDescription: '代码仓库、技术实验与开源探索会在完成整理后逐步公开。',
  identity: {
    name: 'TONG.',
    role: 'Full Stack Developer',
    technologies: ['Java', 'Python', 'AI', 'Vue'],
    statement: 'Building software systems.',
    labels: ['代码仓库', '技术实验', '开源探索'],
  },
  projectsTitle: 'Open Source / Experiments',
  projectsDescription: '可公开的代码、实验和长期维护项目会在这里持续沉淀。',
  projectsEmptyMessage: '正在整理可公开的实验和学习项目；有可公开仓库时会在这里更新。',
  activitiesTitle: 'Technical Activity',
  activities: [
    {
      id: 'writing',
      title: 'Writing',
      description: '沉淀 Spring Boot、AI 应用与架构思考。',
      topics: ['Spring Boot', 'AI', 'Architecture'],
    },
    {
      id: 'building',
      title: 'Building',
      description: '探索全栈、AI 应用与自动化工具的可运行实现。',
      topics: ['Full Stack', 'AI Apps', 'Automation'],
    },
    {
      id: 'learning',
      title: 'Learning',
      description: '持续学习 LLM、Agent 与云端工程实践。',
      topics: ['LLM', 'Agent', 'Cloud'],
    },
  ],
  socialTitle: 'Social Links',
  socialEmptyMessage: '公开社交入口将在真实账号配置后显示。',
  closingLines: ['代码记录过程，', '项目证明能力，', '持续输出创造长期价值。'],
} as const satisfies EcosystemSectionContent;

const englishEcosystemSectionContent = {
  activities: [
    {
      description:
        'Documenting practical thinking around Spring Boot, AI applications and architecture.',
      id: 'writing',
      title: 'Writing',
      topics: ['Spring Boot', 'AI', 'Architecture'],
    },
    {
      description:
        'Exploring working implementations for full-stack systems, AI applications and automation tools.',
      id: 'building',
      title: 'Building',
      topics: ['Full Stack', 'AI Apps', 'Automation'],
    },
    {
      description: 'Continuing to learn about LLMs, agents and cloud engineering practice.',
      id: 'learning',
      title: 'Learning',
      topics: ['LLM', 'Agent', 'Cloud'],
    },
  ],
  activitiesTitle: 'Technical activity',
  closingLines: [
    'Code records the process.',
    'Projects demonstrate capability.',
    'Consistent sharing creates long-term value.',
  ],
  descriptionLines: [
    'Through projects, code and technical writing,',
    'I document the learning process and make my direction visible to others.',
  ],
  eyebrow: 'ECOSYSTEM',
  githubDescription:
    'Repositories, technical experiments and open-source exploration will be shared as they are ready to be maintained publicly.',
  githubTitle: 'GitHub',
  identity: {
    labels: ['Code repositories', 'Technical experiments', 'Open-source exploration'],
    name: 'TONG.',
    role: 'Full Stack Developer',
    statement: 'Building software systems.',
    technologies: ['Java', 'Python', 'AI', 'Vue'],
  },
  number: '08',
  projectsDescription:
    'Public code, experiments and maintained projects will accumulate here over time.',
  projectsEmptyMessage:
    'Public experiments and learning projects are being prepared. This section will be updated when a repository is ready to share.',
  projectsTitle: 'Open source / experiments',
  socialEmptyMessage: 'Public social links will appear after real accounts are configured.',
  socialTitle: 'Social links',
  titleLines: ['Keep building,', 'keep sharing,', 'keep compounding.'],
} as const satisfies EcosystemSectionContent;

export function getEcosystemSectionContent(locale: Locale): EcosystemSectionContent {
  return locale === 'en-US' ? englishEcosystemSectionContent : ecosystemSectionContent;
}

export function getEcosystemUiCopy(locale: Locale): EcosystemUiCopy {
  return ecosystemUiCopyByLocale[locale];
}
