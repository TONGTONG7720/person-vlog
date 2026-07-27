import type { Locale } from '@/types/i18n';

type PrivacySection = Readonly<{
  readonly body: string;
  readonly title: string;
}>;

export type PrivacyContent = Readonly<{
  readonly contactLink: string;
  readonly description: string;
  readonly eyebrow: string;
  readonly intro: string;
  readonly sections: readonly PrivacySection[];
  readonly title: string;
  readonly updateBody: string;
  readonly updateSuffix: string;
  readonly updateTitle: string;
}>;

const privacyContentByLocale = {
  'en-US': {
    contactLink: 'contact page',
    description:
      'Learn how this site handles anonymous visits, content interactions and contact conversions with minimal data.',
    eyebrow: 'PRIVACY / MINIMAL DATA',
    intro:
      'Only the minimum data needed to improve content and collaboration is collected. Your private project details are not recorded in site analytics.',
    sections: [
      {
        body: 'This site uses Vercel Web Analytics to understand anonymous visit trends and a first-party event system to understand use of pages, projects, articles, services, contact entry points and the AI assistant. Events only store the page path, constrained content identifiers, event time, language and optional UTM source labels.',
        title: 'What is collected',
      },
      {
        body: 'Data is only used to understand which content is helpful, which services receive attention and how to improve the journey from reading to project conversations. It is not used to build cross-site profiles, and it is never sold or rented.',
        title: 'Why it is collected',
      },
      {
        body: 'The site analytics database does not store IP addresses, device fingerprints, passwords, contact-form bodies, email addresses or AI conversation text. The AI assistant only records predefined intent categories such as projects, services, technology or collaboration.',
        title: 'What is not collected',
      },
      {
        body: 'Links carrying utm_source, utm_medium or utm_campaign keep the first source in the current browser session to understand the effect of content from Douyin, Xiaohongshu, GitHub or search. That session source is not retained by this site after the browser session ends.',
        title: 'Attribution and sessions',
      },
      {
        body: 'You can use the browser Do Not Track preference to disable client-side analytics. Contact details are used only to respond to your project enquiry. English and Chinese page events are analyzed separately without identifying visitors.',
        title: 'Your choices and contact',
      },
    ],
    title: 'Privacy',
    updateBody:
      'This notice will be updated if the analytics approach changes materially. For a clearer explanation, please visit the ',
    updateSuffix: '.',
    updateTitle: 'Contact and updates',
  },
  'zh-CN': {
    contactLink: '联系合作页面',
    description: '了解本网站如何以最小化方式处理匿名访问、内容互动和联系转化数据。',
    eyebrow: 'PRIVACY / MINIMAL DATA',
    intro: '只收集改善内容与合作体验所需的最少数据，不记录你的私人项目内容。',
    sections: [
      {
        body: '本站使用 Vercel Web Analytics 了解匿名访问趋势，并使用本站的一方事件系统了解页面、项目、文章、服务、联系入口和 AI 助手的使用情况。站内事件只保存页面路径、受限的内容标识、事件时间、语言与可选的 UTM 来源标签。',
        title: '收集什么',
      },
      {
        body: '数据只用于判断哪些内容更有帮助、哪些服务更受关注，以及优化从内容浏览到联系合作的体验。不会用于建立跨网站用户画像，也不会出售或出租。',
        title: '为什么收集',
      },
      {
        body: '站内分析数据库不会保存 IP 地址、设备指纹、密码、联系表单正文、邮箱或 AI 对话正文。AI 助手仅记录预定义的咨询分类，例如项目、服务、技术或合作方式。',
        title: '明确不收集',
      },
      {
        body: '带有 utm_source、utm_medium 或 utm_campaign 的链接会在当前浏览器会话内保存首次来源，用于判断抖音、小红书、GitHub 或搜索内容的效果。关闭浏览器会话后，该来源信息不再由本站会话存储使用。',
        title: '来源与会话',
      },
      {
        body: '可以通过浏览器的“禁止跟踪（Do Not Track）”偏好关闭本站前端统计；联系信息将仅用于回复你的项目咨询。中文与英文页面事件会分别统计，但不会识别访客身份。',
        title: '你的选择与联系',
      },
    ],
    title: '隐私说明',
    updateBody: '本说明会在分析方式发生实质变化时更新。需要进一步说明时，请前往',
    updateSuffix: '。',
    updateTitle: '联系与更新',
  },
} as const satisfies Readonly<Record<Locale, PrivacyContent>>;

export function getPrivacyContent(locale: Locale): PrivacyContent {
  return privacyContentByLocale[locale];
}
