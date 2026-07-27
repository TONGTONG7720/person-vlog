import { ArrowUpRight } from 'lucide-react';

import { Reveal } from '@/components/animation/reveal';
import type { SocialLink } from '@/types/social';

export type SocialLinksProps = Readonly<{
  readonly emptyMessage: string;
  readonly links: readonly SocialLink[];
  readonly title: string;
}>;

function isExternalUrl(url: string): boolean {
  return url.startsWith('https://') || url.startsWith('http://');
}

export function SocialLinks({ emptyMessage, links, title }: SocialLinksProps): React.JSX.Element {
  return (
    <section aria-labelledby="social-links-heading" className="ecosystem-social-links">
      <Reveal distance={18} duration={0.6} variant="fade-up">
        <div className="ecosystem-section-intro">
          <p className="ecosystem-kicker">SOCIAL LINKS</p>
          <h3 className="ecosystem-subheading" id="social-links-heading">
            {title}
          </h3>
        </div>
      </Reveal>
      {links.length === 0 ? (
        <Reveal delay={0.08} distance={18} duration={0.6} variant="fade-up">
          <p className="ecosystem-social-empty">{emptyMessage}</p>
        </Reveal>
      ) : (
        <ul className="ecosystem-social-list">
          {links.map((link, index) => {
            const externalLink = isExternalUrl(link.url);

            return (
              <li key={link.id}>
                <Reveal
                  delay={Math.min(index * 0.08, 0.24)}
                  distance={18}
                  duration={0.6}
                  variant="fade-up"
                >
                  <a
                    className="ecosystem-social-link"
                    href={link.url}
                    {...(externalLink ? { rel: 'noreferrer', target: '_blank' } : {})}
                  >
                    <span>{link.name}</span>
                    <ArrowUpRight aria-hidden="true" size={16} strokeWidth={1.5} />
                  </a>
                </Reveal>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
