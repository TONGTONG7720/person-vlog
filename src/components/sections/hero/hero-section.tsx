import { HeroBackground } from '@/components/sections/hero/hero-background';
import { HeroContent } from '@/components/sections/hero/hero-content';
import { HeroScrollIndicator } from '@/components/sections/hero/hero-scroll-indicator';
import { Container } from '@/components/ui/container';
import { getHomeContent } from '@/config/home';
import { getRequestLocale } from '@/i18n/server';

export async function HeroSection(): Promise<React.JSX.Element> {
  const locale = await getRequestLocale();
  const { hero } = getHomeContent(locale);

  return (
    <section
      aria-labelledby="hero-heading"
      className="hero-section relative"
      data-locale={locale}
      id="hero"
    >
      <HeroBackground />
      <Container className="hero-inner" size="content">
        <HeroContent content={hero} />
      </Container>
      <HeroScrollIndicator />
    </section>
  );
}
