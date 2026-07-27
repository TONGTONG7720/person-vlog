import { Container } from '@/components/ui/container';
import { Heading } from '@/components/ui/heading';
import { getPrivacyContent } from '@/data/legal';
import { Link } from '@/i18n/navigation';
import { getRequestLocale } from '@/i18n/server';
import { createMetadata } from '@/lib/metadata';

export async function generateMetadata() {
  const locale = await getRequestLocale();
  const content = getPrivacyContent(locale);

  return createMetadata({
    description: content.description,
    locale,
    path: '/privacy',
    title: content.title,
  });
}

export default async function PrivacyPage(): Promise<React.JSX.Element> {
  const locale = await getRequestLocale();
  const content = getPrivacyContent(locale);

  return (
    <section aria-labelledby="privacy-page-title" className="privacy-page">
      <Container size="content">
        <header className="privacy-page-header">
          <p className="section-eyebrow">{content.eyebrow}</p>
          <Heading as="h1" id="privacy-page-title" size="display-md">
            {content.title}
          </Heading>
          <p>{content.intro}</p>
        </header>
        <div className="privacy-page-grid">
          {content.sections.map((section) => (
            <article className="privacy-page-card" key={section.title}>
              <h2>{section.title}</h2>
              <p>{section.body}</p>
            </article>
          ))}
          <article className="privacy-page-card">
            <h2>{content.updateTitle}</h2>
            <p>
              {content.updateBody}
              <Link className="text-brand-primary underline underline-offset-4" href="/contact">
                {content.contactLink}
              </Link>
              {content.updateSuffix}
            </p>
          </article>
        </div>
      </Container>
    </section>
  );
}
