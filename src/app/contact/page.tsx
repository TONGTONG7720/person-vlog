import { ContactForm } from '@/components/forms/contact-form/contact-form';
import { ContactInformation } from '@/components/sections/contact/contact-information';
import { ContactNotes } from '@/components/sections/contact/contact-notes';
import { Reveal } from '@/components/animation/reveal';
import { Heading } from '@/components/ui/heading';
import { Paragraph } from '@/components/ui/paragraph';
import { Section } from '@/components/ui/section';
import { getContactContent } from '@/config/contact';
import { getServiceCategoryLabels, parseServiceCategory } from '@/config/service';
import { getRequestLocale } from '@/i18n/server';
import { createMetadata } from '@/lib/metadata';

export async function generateMetadata() {
  const locale = await getRequestLocale();
  const content = getContactContent(locale);

  return createMetadata({
    description: content.copy.page.description,
    keywords:
      locale === 'en-US'
        ? [
            'Software product development',
            'AI application development',
            'Spring Boot developer',
            'Python automation',
          ]
        : ['软件开发合作', '企业系统开发', 'AI 应用开发', 'Python 自动化', '前后端开发'],
    locale,
    path: '/contact',
    title:
      locale === 'en-US'
        ? 'Contact Tong | Software and AI Product Development'
        : '联系合作 - 软件开发与 AI 应用方案',
  });
}

type ContactPageProps = Readonly<{
  searchParams: Promise<{
    readonly service?: string | string[];
  }>;
}>;

export default async function ContactPage({
  searchParams,
}: ContactPageProps): Promise<React.JSX.Element> {
  const { service } = await searchParams;
  const locale = await getRequestLocale();
  const content = getContactContent(locale);
  const selectedService = parseServiceCategory(service);
  const serviceLabels = getServiceCategoryLabels(locale);

  return (
    <>
      <Section
        ariaLabelledBy="contact-heading"
        className="contact-page-section"
        container="content"
        spacing="lg"
      >
        <div className="contact-page-grid">
          <div className="contact-page-intro-column">
            <Reveal distance={20} duration={0.7} variant="fade-up">
              <div className="contact-page-intro">
                <p className="contact-page-eyebrow">{content.copy.page.eyebrow}</p>
                <Heading as="h1" id="contact-heading" size="display-md">
                  {content.copy.page.title}
                </Heading>
                <Paragraph size="lg">{content.copy.page.description}</Paragraph>
              </div>
            </Reveal>
            {selectedService === undefined ? null : (
              <div className="contact-selected-service" role="status">
                <p>{locale === 'en-US' ? 'Selected service direction' : '已选择的服务方向'}</p>
                <strong>{serviceLabels[selectedService]}</strong>
              </div>
            )}
            <Reveal delay={0.1} distance={18} duration={0.6} variant="fade-up">
              <ContactInformation content={content} />
            </Reveal>
          </div>
          <Reveal
            className="contact-form-reveal"
            delay={0.12}
            distance={20}
            duration={0.68}
            variant="fade-up"
          >
            <ContactForm
              {...(selectedService === undefined ? {} : { initialService: selectedService })}
            />
          </Reveal>
        </div>
        <Reveal delay={0.08} distance={18} duration={0.6} variant="fade-up">
          <ContactNotes content={content} />
        </Reveal>
      </Section>
    </>
  );
}
