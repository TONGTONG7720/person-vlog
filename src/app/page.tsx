import { HomeAboutPreview } from '@/components/sections/about/home-about-preview';
import { HeroSection } from '@/components/sections/hero/hero-section';
import { BlogSection } from '@/components/sections/blog/blog-section';
import { ContactCta } from '@/components/sections/contact/contact-cta';
import { EcosystemSection } from '@/components/sections/ecosystem/ecosystem-section';
import { ProjectsSection } from '@/components/sections/projects/projects-section';
import { ProcessSection } from '@/components/sections/process/process-section';
import { HomeServicesPreview } from '@/components/sections/services/home-services-preview';
import { SkillsSection } from '@/components/sections/skills/skills-section';
import { getHomeContent } from '@/config/home';
import { getRequestLocale } from '@/i18n/server';
import { createMetadata } from '@/lib/metadata';

export async function generateMetadata() {
  const locale = await getRequestLocale();

  return createMetadata({ locale, path: '/', title: getHomeContent(locale).hero.title });
}

export default function Home(): React.JSX.Element {
  return (
    <div>
      <HeroSection />
      <HomeAboutPreview />
      <SkillsSection />
      <ProjectsSection />
      <HomeServicesPreview />
      <ProcessSection />
      <BlogSection />
      <EcosystemSection />
      <ContactCta />
    </div>
  );
}
