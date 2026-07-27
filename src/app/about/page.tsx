import { AboutSection } from '@/components/sections/about/about-section';
import { getAboutSectionCopy } from '@/data/about';
import { getRequestLocale } from '@/i18n/server';
import { createMetadata } from '@/lib/metadata';

export async function generateMetadata() {
  const locale = await getRequestLocale();
  const content = getAboutSectionCopy(locale).content;

  return createMetadata({
    description: content.description,
    locale,
    path: '/about',
    title:
      locale === 'en-US'
        ? 'About Tong | Full Stack Product Development'
        : '关于我 - 全栈开发与技术实践',
  });
}

export default function AboutPage(): React.JSX.Element {
  return <AboutSection />;
}
