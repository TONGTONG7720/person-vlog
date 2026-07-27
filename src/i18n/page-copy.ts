import type { Locale } from '@/types/i18n';

export const publicPageCopy = {
  'en-US': {
    blog: {
      description:
        'Practical notes on Java, Python, Vue, AI applications and software architecture: the choices, trade-offs and solutions behind real product work.',
      eyebrow: 'BLOG / ENGINEERING NOTES',
      title: 'Notes on reusable engineering practice and product thinking.',
    },
    blogDetail: {
      back: 'Back to all articles',
      lastUpdated: 'Last updated:',
      notFound: 'Article not found',
    },
    projectDetail: {
      note: 'This case study is being expanded with product context, delivery decisions and outcomes.',
      notFound: 'Project not found',
    },
    projects: {
      description:
        'These independent product directions are being shaped into fuller case studies with context, responsibilities and delivery decisions.',
      eyebrow: 'PROJECTS / SELECTED DIRECTIONS',
      title: 'Product case studies in progress.',
    },
  },
  'zh-CN': {
    blog: {
      description:
        '围绕 Java、Python、Vue、AI 应用与软件架构，持续整理真实开发过程中的选择、问题与解法。',
      eyebrow: 'BLOG / 技术文章',
      title: '记录可复用的开发经验与产品思考。',
    },
    blogDetail: {
      back: '返回文章目录',
      lastUpdated: '最后更新：',
      notFound: '未找到文章',
    },
    projectDetail: {
      note: '完整项目案例将在后续阶段完善。',
      notFound: '未找到项目',
    },
    projects: {
      description:
        '当前先展示正在梳理的个人项目方向；完整的背景、职责和交付信息会在后续案例页中补充。',
      eyebrow: 'PROJECTS / 方向预览',
      title: '项目案例正在持续完善。',
    },
  },
} as const satisfies Readonly<Record<Locale, object>>;

export function getPublicPageCopy(locale: Locale) {
  return publicPageCopy[locale];
}
