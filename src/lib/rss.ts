import { getSiteConfig } from '@/config/site';
import { getLocalePath } from '@/i18n/config';
import { absoluteUrl } from '@/lib/utils';
import { getPublicBlogPosts } from '@/server/cms/public-content';
import type { Locale } from '@/types/i18n';

export async function createRssResponse(locale: Locale): Promise<Response> {
  const [posts, siteConfig] = await Promise.all([
    getPublicBlogPosts(locale),
    getSiteConfig(locale),
  ]);
  const siteUrl = absoluteUrl(getLocalePath('/', locale));
  const items = posts
    .map((post) => {
      const url = post.canonical ?? absoluteUrl(getLocalePath(`/blog/${post.slug}`, locale));
      const publishedAt = new Date(post.publishedAt).toUTCString();

      return [
        '<item>',
        `<title>${escapeXml(post.title)}</title>`,
        `<link>${escapeXml(url)}</link>`,
        `<guid isPermaLink="true">${escapeXml(url)}</guid>`,
        `<description>${escapeXml(post.seoDescription ?? post.description)}</description>`,
        `<pubDate>${publishedAt}</pubDate>`,
        `<category>${escapeXml(post.category)}</category>`,
        ...post.keywords.map((keyword) => `<category>${escapeXml(keyword)}</category>`),
        '</item>',
      ].join('');
    })
    .join('');

  const body = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0">',
    '<channel>',
    `<title>${escapeXml(siteConfig.title)}</title>`,
    `<link>${escapeXml(siteUrl)}</link>`,
    `<description>${escapeXml(siteConfig.description)}</description>`,
    `<language>${siteConfig.locale}</language>`,
    `<lastBuildDate>${new Date().toUTCString()}</lastBuildDate>`,
    items,
    '</channel>',
    '</rss>',
  ].join('');

  return new Response(body, {
    headers: {
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      'Content-Type': 'application/rss+xml; charset=utf-8',
    },
  });
}

function escapeXml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}
