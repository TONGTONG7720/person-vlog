import type { MetadataRoute } from 'next';

import { env } from '@/config/env';
import { siteConfig } from '@/config/site';
import { absoluteUrl } from '@/lib/utils';

export default function robots(): MetadataRoute.Robots {
  if (!env.isProductionSite) {
    return {
      rules: {
        disallow: '/',
        userAgent: '*',
      },
    };
  }

  return {
    host: siteConfig.url,
    rules: {
      allow: '/',
      userAgent: '*',
    },
    sitemap: absoluteUrl('/sitemap.xml'),
  };
}
