'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useLocale } from 'next-intl';
import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { useForm, type DefaultValues, type SubmitHandler } from 'react-hook-form';

import { BudgetSelect } from '@/components/forms/contact-form/budget-select';
import { ContactField } from '@/components/forms/contact-form/contact-field';
import { ServiceSelect } from '@/components/forms/contact-form/service-select';
import { SubmitButton } from '@/components/forms/contact-form/submit-button';
import { SuccessMessage } from '@/components/forms/contact-form/success-message';
import { TextareaField } from '@/components/forms/contact-form/textarea-field';
import { getContactContent } from '@/config/contact';
import { getEnabledSocialLinks } from '@/config/social';
import {
  contactApiResponseSchema,
  createContactFormSchema,
  type ContactFormValues,
} from '@/lib/validations/contact';
import { trackContactSubmission } from '@/lib/analytics';
import { resolveContactLeadSource } from '@/lib/contact-lead-source';
import type { ServiceCategory } from '@/types/service';

type SubmissionState = 'idle' | 'error' | 'success';

export type ContactFormProps = Readonly<{
  readonly initialService?: ServiceCategory;
}>;

export function ContactForm({ initialService }: ContactFormProps): React.JSX.Element {
  const locale = useLocale() === 'en-US' ? 'en-US' : 'zh-CN';
  const content = getContactContent(locale);
  const formSchema = useMemo(() => createContactFormSchema(locale), [locale]);
  const [submissionState, setSubmissionState] = useState<SubmissionState>('idle');
  const formOpenedAtRef = useRef<number | null>(null);
  const honeypotRef = useRef<HTMLInputElement>(null);
  const defaultValues: DefaultValues<ContactFormValues> = {
    budget: '',
    company: '',
    email: '',
    message: '',
    name: '',
    timeline: '',
    ...(initialService === undefined ? {} : { service: initialService }),
  };
  const emailContact = getEnabledSocialLinks().find(
    (link) => link.id === 'email' && link.url.startsWith('mailto:'),
  );
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
  } = useForm<ContactFormValues>({
    defaultValues,
    mode: 'onBlur',
    reValidateMode: 'onChange',
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    formOpenedAtRef.current = Date.now();
  }, []);

  const onSubmit: SubmitHandler<ContactFormValues> = async (values) => {
    setSubmissionState('idle');
    const source = resolveContactLeadSource();

    try {
      const response = await fetch('/api/contact', {
        body: JSON.stringify({
          ...values,
          formOpenedAt: formOpenedAtRef.current ?? Date.now(),
          ...(source === undefined ? {} : { source }),
          website: honeypotRef.current?.value ?? '',
        }),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      });
      const responseBody: unknown = await response.json();
      const parsedResponse = contactApiResponseSchema.safeParse(responseBody);

      if (!response.ok || !parsedResponse.success || parsedResponse.data.kind !== 'accepted') {
        setSubmissionState('error');

        return;
      }

      reset(defaultValues);
      setSubmissionState('success');
      trackContactSubmission(values.service);
    } catch (error) {
      if (error instanceof SyntaxError || error instanceof TypeError) {
        setSubmissionState('error');

        return;
      }

      throw error;
    }
  };

  if (submissionState === 'success') {
    return <SuccessMessage message={content.copy.success} />;
  }

  const onFormSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    void handleSubmit(onSubmit)(event);
  };

  return (
    <div className="contact-form-shell">
      <div className="contact-form-heading">
        <p className="contact-form-kicker">{content.copy.form.kicker}</p>
        <h2>{content.copy.form.heading}</h2>
        <p>{content.copy.form.helper}</p>
      </div>
      <form className="contact-form" noValidate onSubmit={onFormSubmit}>
        <div aria-hidden="true" className="contact-honeypot">
          <label htmlFor="contact-website">{content.copy.form.honeypotLabel}</label>
          <input
            autoComplete="off"
            id="contact-website"
            name="website"
            ref={honeypotRef}
            tabIndex={-1}
            type="text"
          />
        </div>
        <fieldset className="contact-form-fieldset">
          <legend className="sr-only">{content.copy.form.legend}</legend>
          <div className="contact-form-grid">
            <ContactField
              autoComplete="name"
              error={errors.name}
              id="contact-name"
              label={content.copy.form.name}
              registration={register('name')}
              required
            />
            <ContactField
              autoComplete="email"
              error={errors.email}
              id="contact-email"
              label={content.copy.form.email}
              registration={register('email')}
              required
              type="email"
            />
          </div>
          <ContactField
            autoComplete="organization"
            error={errors.company}
            id="contact-company"
            label={content.copy.form.company}
            registration={register('company')}
          />
          <ServiceSelect
            error={errors.service}
            id="contact-service"
            label={content.copy.form.service}
            options={content.services}
            placeholder={content.copy.form.servicePlaceholder}
            registration={register('service')}
          />
          <div className="contact-form-grid">
            <BudgetSelect
              error={errors.budget}
              id="contact-budget"
              label={content.copy.form.budget}
              options={content.budgets}
              placeholder={content.copy.form.optionalChoice}
              registration={register('budget')}
            />
            <BudgetSelect
              error={errors.timeline}
              id="contact-timeline"
              label={content.copy.form.timeline}
              options={content.timelines}
              placeholder={content.copy.form.optionalChoice}
              registration={register('timeline')}
            />
          </div>
          <TextareaField
            error={errors.message}
            id="contact-message"
            label={content.copy.form.message}
            maxLength={2_000}
            minLength={10}
            placeholder={content.copy.form.messagePlaceholder}
            registration={register('message')}
            required
            rows={7}
          />
        </fieldset>
        {submissionState === 'error' ? (
          <div className="contact-submit-error" role="alert">
            <p>{content.copy.failure}</p>
            {emailContact === undefined ? null : (
              <a href={emailContact.url}>{content.copy.form.emailFallback}</a>
            )}
          </div>
        ) : null}
        <SubmitButton
          isSubmitting={isSubmitting}
          label={content.copy.form.submit}
          loadingLabel={content.copy.form.sending}
        />
      </form>
    </div>
  );
}
