import { BrandLogo } from '@/components/navigation/brand-logo';
import { NewsletterReservation } from '@/components/content/newsletter-reservation';
import { useLocale, useTranslations } from 'next-intl';
import { BackToTop } from '@/components/layout/back-to-top';
import { FooterNavigation } from '@/components/layout/footer-navigation';
import { Container } from '@/components/ui/container';
import { Paragraph } from '@/components/ui/paragraph';
import { getSiteConfig } from '@/config/site';
import { Link } from '@/i18n/navigation';

export function SiteFooter(): React.JSX.Element {
  const currentYear = new Date().getFullYear();
  const locale = useLocale() === 'en-US' ? 'en-US' : 'zh-CN';
  const siteConfig = getSiteConfig(locale);
  const t = useTranslations('footer');

  return (
    <footer className="border-border-subtle border-t">
      <Container className="py-[var(--section-space-sm)]" size="content">
        <div className="grid gap-12 md:grid-cols-[minmax(0,1fr)_12rem]">
          <div className="max-w-[var(--container-text-max)]">
            <BrandLogo />
            <Paragraph className="mt-4" size="md">
              {t('description')}
            </Paragraph>
          </div>
          <FooterNavigation />
        </div>
        <NewsletterReservation />
        <div className="border-border-subtle mt-12 flex flex-col gap-4 border-t pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="type-caption text-subtle">
            © {currentYear} {siteConfig.name}. {t('copyright')}
          </p>
          <div className="flex items-center gap-4">
            <Link
              className="type-caption text-subtle hover:text-ink transition-colors"
              href="/privacy"
            >
              {t('privacy')}
            </Link>
            <Link
              className="type-caption text-subtle hover:text-ink transition-colors"
              href="/rss.xml"
            >
              RSS
            </Link>
            <BackToTop />
          </div>
        </div>
      </Container>
    </footer>
  );
}
