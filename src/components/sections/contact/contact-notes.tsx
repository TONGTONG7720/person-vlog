import type { ContactContent } from '@/config/contact';

export type ContactNotesProps = Readonly<{
  content: ContactContent;
}>;

export function ContactNotes({ content }: ContactNotesProps): React.JSX.Element {
  return (
    <section aria-labelledby="contact-faq-heading" className="contact-notes">
      <div>
        <p className="contact-notes-kicker">FAQ</p>
        <h2 id="contact-faq-heading">{content.copy.notesTitle}</h2>
      </div>
      <dl>
        {content.faqs.map((faq) => (
          <div key={faq.question}>
            <dt>{faq.question}</dt>
            <dd>{faq.answer}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
