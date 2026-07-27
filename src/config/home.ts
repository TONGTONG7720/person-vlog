export type HeroAction = Readonly<{
  href: string;
  label: string;
}>;

export type HeroAvailability = Readonly<{
  available: boolean;
  availableLabel: string;
  unavailableLabel: string;
}>;

export type HeroContent = Readonly<{
  availability: HeroAvailability;
  compactTitleLines: readonly [string, string, string, string];
  description: string;
  eyebrow: string;
  greeting: string;
  primaryAction: HeroAction;
  secondaryAction: HeroAction;
  technologies: readonly string[];
  title: string;
  titleLines: readonly [string, string];
  mobileTitleLines: readonly [string, string, string];
}>;

type HomeContent = Readonly<{
  hero: HeroContent;
}>;

export const homeContent = {
  'en-US': {
    hero: {
      availability: {
        available: true,
        availableLabel: 'Available for selected product collaborations',
        unavailableLabel:
          'The current schedule is full; future collaborations can still be planned',
      },
      compactTitleLines: ['I turn ideas', 'into reliable', 'software', 'products.'],
      description:
        'A full stack developer focused on Java, Python, Vue and AI applications for founders, teams and growing businesses.',
      eyebrow: 'FULL STACK DEVELOPER · AI PRODUCT BUILDER',
      greeting: 'Hello, I am Tong.',
      primaryAction: {
        href: '/projects',
        label: 'View projects',
      },
      secondaryAction: {
        href: '/contact',
        label: 'Start a conversation',
      },
      technologies: ['Java', 'Python', 'Vue', 'AI'],
      mobileTitleLines: ['I turn ideas', 'into reliable', 'software products.'],
      title: 'I turn ideas into reliable software products.',
      titleLines: ['I turn ideas', 'into reliable software products.'],
    },
  },
  'zh-CN': {
    hero: {
      availability: {
        available: true,
        availableLabel: '目前可接受新的项目合作',
        unavailableLabel: '当前档期已满，可预约后续合作',
      },
      compactTitleLines: ['我把想法，', '做成真正', '可运行的', '产品。'],
      description:
        '专注于 Java、Python、Vue 与 AI 应用开发，为个人、创业团队和企业构建可靠、实用且具有良好体验的软件产品。',
      eyebrow: 'FULL STACK DEVELOPER · AI PRODUCT BUILDER',
      greeting: '你好，我是瞳瞳。',
      primaryAction: {
        href: '/projects',
        label: '查看项目',
      },
      secondaryAction: {
        href: '/contact',
        label: '联系合作',
      },
      technologies: ['Java', 'Python', 'Vue', 'AI'],
      mobileTitleLines: ['我把想法，', '做成真正', '可运行的产品。'],
      title: '我把想法，做成真正可运行的产品。',
      titleLines: ['我把想法，', '做成真正可运行的产品。'],
    },
  },
} as const satisfies Readonly<Record<Locale, HomeContent>>;

export const heroContent = homeContent['zh-CN'].hero;

export function getHomeContent(locale: Locale): HomeContent {
  return homeContent[locale];
}
import type { Locale } from '@/types/i18n';
