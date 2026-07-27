import { getEnabledSocialLinks } from '@/config/social';
import { getSiteConfig } from '@/config/site';
import { defaultLocale, getLocalePath } from '@/i18n/config';
import type { BlogPost } from '@/types/blog';
import type { Locale } from '@/types/i18n';
import type { Project } from '@/types/project';
import { absoluteUrl } from '@/lib/utils';

export type JsonLd = Readonly<Record<string, unknown>>;

function getPersonId(): string {
  return `${getSiteConfig(defaultLocale).url}#person`;
}

export function generatePersonSchema(locale: Locale = defaultLocale): JsonLd {
  const siteConfig = getSiteConfig(locale);
  const socialLinks = getEnabledSocialLinks();
  const email = socialLinks.find((link) => link.id === 'email' && link.url.startsWith('mailto:'));
  const sameAs = socialLinks
    .filter((link) => link.id !== 'email' && /^https?:\/\//.test(link.url))
    .map((link) => link.url);

  return {
    '@context': 'https://schema.org',
    '@id': getPersonId(),
    '@type': 'Person',
    jobTitle: siteConfig.author.jobTitle,
    name: siteConfig.author.name,
    url: absoluteUrl(getLocalePath('/', locale)),
    ...(email === undefined ? {} : { email: email.url.replace('mailto:', '') }),
    ...(sameAs.length === 0 ? {} : { sameAs }),
  };
}

export function generateWebsiteSchema(locale: Locale = defaultLocale): JsonLd {
  const siteConfig = getSiteConfig(locale);

  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    author: { '@id': getPersonId() },
    description: siteConfig.description,
    inLanguage: siteConfig.locale,
    name: siteConfig.name,
    url: absoluteUrl(getLocalePath('/', locale)),
  };
}

export function generateArticleSchema(post: BlogPost, locale: Locale = defaultLocale): JsonLd {
  const siteConfig = getSiteConfig(locale);
  const description = post.seoDescription ?? post.description;
  const headline = post.seoTitle ?? post.title;
  const url = post.canonical ?? absoluteUrl(getLocalePath(`/blog/${post.slug}`, locale));

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    author: {
      '@type': 'Person',
      name: post.author,
    },
    dateModified: post.updatedAt ?? post.publishedAt,
    datePublished: post.publishedAt,
    description,
    headline,
    inLanguage: siteConfig.locale,
    keywords: [...post.keywords, ...post.tags].join(', '),
    mainEntityOfPage: url,
    publisher: { '@id': getPersonId() },
    ...(post.ogImage === undefined && post.coverImage === undefined
      ? {}
      : { image: post.ogImage ?? post.coverImage }),
    url,
  };
}

export function generateProjectSchema(project: Project, locale: Locale = defaultLocale): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    author: { '@id': getPersonId() },
    dateCreated: `${project.year}-01-01`,
    description: project.description,
    keywords: project.technologies,
    name: project.title,
    url: absoluteUrl(getLocalePath(`/projects/${project.slug}`, locale)),
  };
}

export function serializeJsonLd(schema: JsonLd): string {
  return JSON.stringify(schema).replace(/</g, '\\u003c');
}
