import * as Sentry from '@sentry/nextjs';

const sentryDsn =
  process.env['SENTRY_DSN']?.trim() || process.env['NEXT_PUBLIC_SENTRY_DSN']?.trim();

Sentry.init({
  ...(sentryDsn === undefined || sentryDsn === '' ? {} : { dsn: sentryDsn }),
  beforeSend(event) {
    if (event.request === undefined) {
      return event;
    }

    const { cookies: _cookies, data: _data, headers: _headers, ...safeRequest } = event.request;

    return { ...event, request: safeRequest };
  },
  enabled: process.env['NODE_ENV'] === 'production' && sentryDsn !== undefined && sentryDsn !== '',
  environment: process.env['VERCEL_ENV'] ?? process.env['NODE_ENV'] ?? 'development',
  sendDefaultPii: false,
  tracesSampleRate: 0.05,
});
