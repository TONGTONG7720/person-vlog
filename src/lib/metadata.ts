import type { Metadata } from 'next';

import { env } from '@/config/env';
import { getSiteConfig } from '@/config/site';
import { defaultLocale, getLocalePath } from '@/i18n/config';
import { getHreflangAlternates } from '@/lib/hreflang';
import { absoluteUrl, isExternalUrl } from '@/lib/utils';
import type { Locale } from '@/types/i18n';

type MetadataOptions = {
  readonly title?: string;
  readonly description?: string;
  readonly image?: string;
  readonly keywords?: readonly string[];
  readonly locale?: Locale;
  readonly noIndex?: boolean;
  readonly path?: string;
};

export function createMetadata(options: MetadataOptions = {}): Metadata {
  const locale = options.locale ?? defaultLocale;
  const siteConfig = getSiteConfig(locale);
  const path = options.path ?? '/';
  const canonicalUrl = isExternalUrl(path) ? path : absoluteUrl(getLocalePath(path, locale));
  const imagePath = options.image ?? getLocalePath('/opengraph-image', locale);
  const image = isExternalUrl(imagePath) ? imagePath : absoluteUrl(imagePath);
  const description = options.description ?? siteConfig.description;
  const title = options.title ?? siteConfig.title;
  const keywords = options.keywords ?? siteConfig.keywords;
  const noIndex = options.noIndex === true || !env.isProductionSite;
  const robots = noIndex
    ? { follow: false, index: false, nocache: true }
    : { follow: true, index: true };

  return {
    metadataBase: new URL(siteConfig.url),
    title,
    description,
    applicationName: siteConfig.name,
    authors: [{ name: siteConfig.author.name }],
    keywords: [...keywords],
    alternates: {
      canonical: canonicalUrl,
      ...(isExternalUrl(path) ? {} : { languages: getHreflangAlternates(path) }),
    },
    openGraph: {
      type: 'website',
      locale: siteConfig.locale.replace('-', '_'),
      url: canonicalUrl,
      title,
      description,
      siteName: siteConfig.name,
      images: [
        {
          alt: siteConfig.title,
          height: 630,
          url: image,
          width: 1200,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
    robots,
  };
}
