import type { NextConfig } from 'next';
import { withSerwist } from '@serwist/turbopack';
import { withSentryConfig } from '@sentry/nextjs';
import createNextIntlPlugin from 'next-intl/plugin';

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
] as const;

const nextConfig: NextConfig = {
  output: 'standalone',
  outputFileTracingIncludes: {
    '/api/assistant': ['./src/ai/knowledge/**/*.md'],
    '/admin/ai/**': ['./src/ai/templates/**/*.md'],
  },
  async headers() {
    return [
      {
        headers: securityHeaders.map((header) => ({ ...header })),
        source: '/:path*',
      },
    ];
  },
  images: {
    formats: ['image/avif', 'image/webp'],
  },
};

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const configuredSentryBuildOptions = {
  ...(process.env['SENTRY_AUTH_TOKEN'] === undefined ||
  process.env['SENTRY_ORG'] === undefined ||
  process.env['SENTRY_PROJECT'] === undefined
    ? {}
    : {
        authToken: process.env['SENTRY_AUTH_TOKEN'],
        org: process.env['SENTRY_ORG'],
        project: process.env['SENTRY_PROJECT'],
      }),
  silent: process.env['CI'] === undefined,
};

export default withSentryConfig(
  withSerwist(withNextIntl(nextConfig)),
  configuredSentryBuildOptions,
);
