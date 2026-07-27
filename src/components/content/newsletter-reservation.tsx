'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';

export function NewsletterReservation(): React.JSX.Element {
  const locale = useLocale() === 'en-US' ? 'en-US' : 'zh-CN';
  const t = useTranslations('newsletter');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setStatus('loading');
    setMessage('');

    try {
      const response = await fetch('/api/newsletter', {
        body: JSON.stringify({ email, locale, source: 'footer' }),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      });
      const payload: unknown = await response.json();
      const responseMessage = getResponseMessage(payload, t('fallbackError'));

      if (!response.ok) {
        setStatus('error');
        setMessage(responseMessage);

        return;
      }

      setStatus('success');
      setMessage(responseMessage);
      setEmail('');
    } catch {
      setStatus('error');
      setMessage(t('fallbackError'));
    }
  }

  return (
    <section aria-labelledby="newsletter-title" className="newsletter-reservation">
      <div>
        <p className="type-caption text-subtle font-mono tracking-[0.08em]">JOURNAL</p>
        <h2 id="newsletter-title">{t('title')}</h2>
        <p>{t('description')}</p>
      </div>
      <form onSubmit={handleSubmit}>
        <label>
          <span className="visually-hidden">{t('emailLabel')}</span>
          <input
            autoComplete="email"
            onChange={(event) => setEmail(event.target.value)}
            placeholder={t('placeholder')}
            required
            type="email"
            value={email}
          />
        </label>
        <button disabled={status === 'loading'} type="submit">
          {status === 'loading' ? t('loading') : t('submit')}
        </button>
      </form>
      {message === '' ? null : (
        <p data-status={status} role={status === 'error' ? 'alert' : 'status'}>
          {message}
        </p>
      )}
    </section>
  );
}

function getResponseMessage(value: unknown, fallback: string): string {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    return fallback;
  }

  const message = (value as Record<string, unknown>)['message'];

  return typeof message === 'string' ? message : fallback;
}
