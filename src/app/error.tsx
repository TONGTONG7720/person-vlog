'use client';

import { useTranslations } from 'next-intl';
import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { buttonVariants } from '@/components/ui/button-variants';
import { Container } from '@/components/ui/container';
import { Heading } from '@/components/ui/heading';
import { Paragraph } from '@/components/ui/paragraph';
import { Section } from '@/components/ui/section';
import { Link } from '@/i18n/navigation';

type ErrorPageProps = Readonly<{
  error: Error & { digest?: string };
  reset: () => void;
}>;

export default function Error({ error, reset }: ErrorPageProps): React.JSX.Element {
  const t = useTranslations('error');
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);
  const detail = error.digest ? t('detailWithDigest') : t('detail');

  return (
    <>
      <meta content="noindex,nofollow" name="robots" />
      <Section aria-labelledby="error-title">
        <Container size="narrow">
          <Heading as="h1" id="error-title" size="h1">
            {t('title')}
          </Heading>
          <Paragraph className="mt-4">{detail}</Paragraph>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button onClick={reset}>{t('retry')}</Button>
            <Link className={buttonVariants({ variant: 'secondary' })} href="/">
              {t('home')}
            </Link>
          </div>
        </Container>
      </Section>
    </>
  );
}
