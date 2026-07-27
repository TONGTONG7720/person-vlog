import { ArrowUpRight } from 'lucide-react';

import { contactSocialLinkIds, type ContactContent } from '@/config/contact';
import { getEnabledSocialLinks } from '@/config/social';

export type ContactInformationProps = Readonly<{
  content: ContactContent;
}>;

export function ContactInformation({ content }: ContactInformationProps): React.JSX.Element {
  const enabledLinks = getEnabledSocialLinks();
  const contactLinks = contactSocialLinkIds.flatMap((id) => {
    const link = enabledLinks.find((item) => item.id === id);

    return link === undefined ? [] : [link];
  });

  return (
    <div className="contact-information">
      <p className="contact-information-message">
        {content.copy.information.introLines.map((line, index) => (
          <span key={line}>
            {line}
            {index === content.copy.information.introLines.length - 1 ? null : <br />}
            {index === 2 ? <br /> : null}
          </span>
        ))}
      </p>
      <section aria-labelledby="contact-information-heading" className="contact-information-block">
        <h2 id="contact-information-heading">{content.copy.information.contactTitle}</h2>
        {contactLinks.length === 0 ? (
          <p>{content.copy.information.emptyContact}</p>
        ) : (
          <ul>
            {contactLinks.map((link) => {
              const isExternalProfile =
                link.url.startsWith('https://') || link.url.startsWith('http://');

              return (
                <li key={link.id}>
                  <a
                    href={link.url}
                    {...(isExternalProfile ? { rel: 'noreferrer', target: '_blank' } : {})}
                  >
                    <span>{link.name}</span>
                    <ArrowUpRight aria-hidden="true" size={16} strokeWidth={1.6} />
                  </a>
                </li>
              );
            })}
          </ul>
        )}
      </section>
      <section
        aria-labelledby="contact-collaboration-heading"
        className="contact-information-block"
      >
        <h2 id="contact-collaboration-heading">{content.copy.information.scenariosTitle}</h2>
        <ul className="contact-collaboration-list">
          {content.collaborationNotes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
