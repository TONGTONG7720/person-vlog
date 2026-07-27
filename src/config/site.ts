import { env } from '@/config/env';
import { socialLinks } from '@/config/social';
import type { Locale } from '@/types/i18n';

const siteCopyByLocale = {
  'en-US': {
    author: {
      jobTitle: 'Full Stack Developer',
      name: 'Tong',
    },
    description:
      'A full stack developer focused on Java, Python, Vue and AI applications for dependable business software and product delivery.',
    keywords: [
      'Full Stack Developer',
      'AI Application Development',
      'Spring Boot Developer',
      'Python Developer',
      'Java Enterprise Software',
      'RAG Knowledge Base',
      'Vue Developer',
      'Software Product Development',
    ],
    name: 'Tong',
    title: 'Tong | Full Stack Developer Building AI Products',
  },
  'zh-CN': {
    author: {
      jobTitle: 'Full Stack Developer',
      name: '瞳瞳',
    },
    description:
      '专注于 Java、Python、Vue 与 AI 应用开发，提供企业系统开发、AI 产品开发、自动化工具和技术方案设计。',
    keywords: [
      'Java 开发',
      'Spring Boot 开发',
      'Vue 开发',
      'Python 开发',
      'AI 应用开发',
      'RAG 知识库',
      '企业管理系统开发',
      '全栈开发',
      '软件定制开发',
      '技术博客',
    ],
    name: '瞳瞳',
    title: '瞳瞳 | Java、Python、Vue 与 AI 全栈开发',
  },
} as const satisfies Readonly<
  Record<
    Locale,
    Readonly<{
      readonly author: Readonly<{ readonly jobTitle: string; readonly name: string }>;
      readonly description: string;
      readonly keywords: readonly string[];
      readonly name: string;
      readonly title: string;
    }>
  >
>;

export function getSiteConfig(locale: Locale) {
  return {
    ...siteCopyByLocale[locale],
    locale,
    social: socialLinks,
    url: env.siteUrl,
  } as const;
}

export const siteConfig = getSiteConfig('zh-CN');
