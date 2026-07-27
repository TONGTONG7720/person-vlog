import { getTranslations } from 'next-intl/server';

import { buttonVariants } from '@/components/ui/button-variants';
import { Container } from '@/components/ui/container';
import { Heading } from '@/components/ui/heading';
import { Paragraph } from '@/components/ui/paragraph';
import { Section } from '@/components/ui/section';
import { Link } from '@/i18n/navigation';
import { createMetadata } from '@/lib/metadata';
import { cn } from '@/lib/utils';

export async function generateMetadata() {
  const t = await getTranslations('notFound');

  return createMetadata({
    noIndex: true,
    path: '/not-found',
    title: t('title'),
  });
}

export default async function NotFound(): Promise<React.JSX.Element> {
  const t = await getTranslations('notFound');

  return (
    <Section aria-labelledby="not-found-title">
      <Container size="narrow">
        <Heading as="h1" id="not-found-title" size="h1">
          {t('title')}
        </Heading>
        <Paragraph className="mt-4">{t('description')}</Paragraph>
        <Link className={cn(buttonVariants(), 'mt-8')} href="/">
          {t('home')}
        </Link>
      </Container>
    </Section>
  );
}
