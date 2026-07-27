'use client';

import { ArrowRight } from 'lucide-react';
import { useLocale } from 'next-intl';

import { MagneticLink } from '@/components/animation/magnetic-link';
import { Reveal } from '@/components/animation/reveal';
import { Container } from '@/components/ui/container';
import { Heading } from '@/components/ui/heading';
import { Paragraph } from '@/components/ui/paragraph';
import { buttonVariants } from '@/components/ui/button-variants';
import { getContactContent } from '@/config/contact';
import { getHomePreviewCopy } from '@/data/home-preview';
import { Link } from '@/i18n/navigation';
import { trackContactClick } from '@/lib/analytics';
import { cn } from '@/lib/utils';

export function ContactCta(): React.JSX.Element {
  const locale = useLocale() === 'en-US' ? 'en-US' : 'zh-CN';
  const copy = getContactContent(locale).copy.cta;
  const brief = getHomePreviewCopy(locale).contactBrief;

  return (
    <section aria-labelledby="contact-cta-heading" className="contact-cta" id="contact">
      <div aria-hidden="true" className="contact-cta-glow" />
      <Container className="contact-cta-container" size="content">
        <div className="contact-cta-copy">
          <Reveal distance={18} duration={0.6} variant="fade-up">
            <p className="contact-cta-eyebrow">{copy.eyebrow}</p>
          </Reveal>
          <Reveal delay={0.08} distance={20} duration={0.72} variant="fade-up">
            <Heading
              as="h2"
              className="contact-cta-heading"
              id="contact-cta-heading"
              size="display-lg"
            >
              {copy.titleLines.map((line) => (
                <span className="block" key={line}>
                  {line}
                </span>
              ))}
            </Heading>
          </Reveal>
          <Reveal delay={0.16} distance={18} duration={0.6} variant="fade-up">
            <Paragraph className="contact-cta-description" size="lg">
              {copy.description}
            </Paragraph>
          </Reveal>
          <Reveal delay={0.2} distance={14} duration={0.52} variant="fade-up">
            <ol aria-label={copy.primaryAction} className="contact-cta-brief">
              {brief.map((item, index) => (
                <li key={item}>
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <strong>{item}</strong>
                </li>
              ))}
            </ol>
          </Reveal>
          <Reveal delay={0.24} distance={16} duration={0.56} variant="fade-up">
            <div className="contact-cta-actions">
              <MagneticLink
                className={cn(buttonVariants({ size: 'lg' }), 'group')}
                href="/contact"
                onClick={() => trackContactClick('contact_cta')}
              >
                {copy.primaryAction}
                <ArrowRight
                  aria-hidden="true"
                  className="size-4 transition-transform duration-[var(--motion-fast)] group-hover:translate-x-0.5"
                  strokeWidth={1.7}
                />
              </MagneticLink>
              <Link
                className={buttonVariants({ size: 'lg', variant: 'secondary' })}
                href="/projects"
              >
                {copy.secondaryAction}
              </Link>
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
