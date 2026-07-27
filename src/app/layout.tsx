import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono, Onest } from 'next/font/google';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { getMessages } from 'next-intl/server';
import type { ReactNode } from 'react';

import '@/app/globals.css';
import { ClientLocaleProvider } from '@/components/i18n/client-locale-provider';
import { SiteShell } from '@/components/layout/site-shell';
import { AppProviders } from '@/components/providers/app-providers';
import { JsonLd } from '@/components/seo/json-ld';
import { getRequestLocale } from '@/i18n/server';
import { createMetadata } from '@/lib/metadata';
import { generatePersonSchema, generateWebsiteSchema } from '@/lib/schema';

const geistSans = Geist({
  display: 'swap',
  subsets: ['latin'],
  variable: '--font-geist-sans',
});

const geistMono = Geist_Mono({
  display: 'swap',
  subsets: ['latin'],
  variable: '--font-geist-mono',
});

const onest = Onest({
  display: 'swap',
  subsets: ['latin'],
  variable: '--font-onest',
});

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();

  return {
    ...createMetadata({ locale }),
    appleWebApp: {
      capable: true,
      statusBarStyle: 'black-translucent',
      title: 'Tong',
    },
    formatDetection: {
      telephone: false,
    },
    icons: {
      apple: [
        {
          sizes: '192x192',
          type: 'image/png',
          url: '/icons/icon-192.png',
        },
      ],
    },
  };
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  initialScale: 1,
  themeColor: '#050505',
  viewportFit: 'cover',
  width: 'device-width',
};

type RootLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default async function RootLayout({
  children,
}: RootLayoutProps): Promise<React.JSX.Element> {
  const [locale, messages] = await Promise.all([getRequestLocale(), getMessages()]);

  return (
    <html
      className={[geistSans.variable, geistMono.variable, onest.variable].join(' ')}
      data-scroll-behavior="smooth"
      lang={locale}
    >
      <head>
        <JsonLd data={generatePersonSchema(locale)} />
        <JsonLd data={generateWebsiteSchema(locale)} />
      </head>
      <body>
        <ClientLocaleProvider initialLocale={locale} initialMessages={messages}>
          <AppProviders>
            <SiteShell>{children}</SiteShell>
          </AppProviders>
        </ClientLocaleProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}
