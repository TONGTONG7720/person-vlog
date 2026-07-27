import { describe, expect, it } from 'vitest';

import sitemap from '../src/app/sitemap';
import { blogPosts } from '../src/content/blog/posts';
import { projects } from '../src/data/projects';
import {
  generateArticleSchema,
  generateProjectSchema,
  generateWebsiteSchema,
} from '../src/lib/schema';

describe('SEO foundations', () => {
  it('includes indexable static and content routes in the sitemap', async () => {
    const routes = await sitemap();
    const urls = routes.map((route) => route.url);

    expect(urls).toEqual(
      expect.arrayContaining([
        'http://localhost:3000/',
        'http://localhost:3000/about',
        'http://localhost:3000/projects',
        'http://localhost:3000/projects/store-operations-system',
        'http://localhost:3000/blog/springboot-vue-management-system',
        'http://localhost:3000/contact',
      ]),
    );
    expect(routes.find((route) => route.url === 'http://localhost:3000/')?.priority).toBe(1);
    expect(routes.find((route) => route.url === 'http://localhost:3000/projects')?.priority).toBe(
      0.8,
    );
  });

  it('creates website, article, and project schemas from the content source', () => {
    const website = generateWebsiteSchema();
    const article = generateArticleSchema(blogPosts[0]);
    const project = generateProjectSchema(projects[0]);

    expect(website['@type']).toBe('WebSite');
    expect(article).toMatchObject({
      '@type': 'Article',
      dateModified: blogPosts[0].updatedAt,
      datePublished: blogPosts[0].publishedAt,
      headline: blogPosts[0].seoTitle,
    });
    expect(project).toMatchObject({
      '@type': 'CreativeWork',
      name: projects[0].title,
      url: 'http://localhost:3000/projects/store-operations-system',
    });
  });
});
