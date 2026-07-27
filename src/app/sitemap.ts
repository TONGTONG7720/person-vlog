import type { MetadataRoute } from 'next';

import { getLocalePath, locales } from '@/i18n/config';
import { getHreflangAlternates } from '@/lib/hreflang';
import { staticSitePaths } from '@/lib/constants';
import { absoluteUrl } from '@/lib/utils';
import { getPublicBlogPosts, getPublicProjects } from '@/server/cms/public-content';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [postsByLocale, projectsByLocale] = await Promise.all([
    Promise.all(locales.map(async (locale) => [locale, await getPublicBlogPosts(locale)] as const)),
    Promise.all(locales.map(async (locale) => [locale, await getPublicProjects(locale)] as const)),
  ]);
  const entries: MetadataRoute.Sitemap = [];
  const seen = new Set<string>();

  const addPath = (
    pathname: string,
    options: Omit<MetadataRoute.Sitemap[number], 'alternates' | 'url'>,
  ) => {
    for (const locale of locales) {
      const url = absoluteUrl(getLocalePath(pathname, locale));

      if (seen.has(url)) {
        continue;
      }

      seen.add(url);
      entries.push({
        ...options,
        alternates: { languages: getHreflangAlternates(pathname) },
        url,
      });
    }
  };

  for (const path of staticSitePaths) {
    addPath(path, {
      changeFrequency: path === '/' ? 'weekly' : 'monthly',
      priority: path === '/' ? 1 : path === '/projects' || path === '/blog' ? 0.8 : 0.6,
    });
  }

  for (const [locale, projects] of projectsByLocale) {
    for (const project of projects) {
      const pathname = `/projects/${project.slug}`;
      const url = absoluteUrl(getLocalePath(pathname, locale));

      if (!seen.has(url)) {
        seen.add(url);
        entries.push({
          alternates: { languages: getHreflangAlternates(pathname) },
          changeFrequency: 'monthly',
          priority: 0.8,
          url,
        });
      }
    }
  }

  for (const [locale, posts] of postsByLocale) {
    for (const post of posts) {
      const pathname = `/blog/${post.slug}`;
      const url = absoluteUrl(getLocalePath(pathname, locale));

      if (!seen.has(url)) {
        seen.add(url);
        entries.push({
          alternates: { languages: getHreflangAlternates(pathname) },
          changeFrequency: 'monthly',
          lastModified: new Date(post.updatedAt ?? post.publishedAt),
          priority: 0.8,
          url,
        });
      }
    }
  }

  return entries;
}
