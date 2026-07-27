import { describe, expect, it } from 'vitest';

import { getLocalizedBlogPosts } from '../src/content/blog/posts';
import { getLocalizedProjects } from '../src/data/projects';
import { getLocalizedServices } from '../src/data/services';

describe('localized public content', () => {
  it('keeps Chinese as the source content and exposes authored English project copy', () => {
    expect(getLocalizedProjects('zh-CN')[0]?.title).toBe('连锁门店运营管理系统');
    expect(getLocalizedProjects('en-US')[0]?.title).toBe('Multi-Location Operations System');
  });

  it('localizes service conversion copy without duplicating technical data', () => {
    const englishService = getLocalizedServices('en-US')[0];

    expect(englishService?.title).toBe('Enterprise Software Development');
    expect(englishService?.action.label).toBe('Discuss this service');
    expect(englishService?.technologies).toContain('Spring Boot');
  });

  it('uses independently authored English MDX paths for translated posts', () => {
    const englishPost = getLocalizedBlogPosts('en-US')[0];

    expect(englishPost?.title).toBe('Building a Maintainable Spring Boot + Vue Admin System');
    expect(englishPost?.contentPath).toBe(
      'src/content/blog/en-US/springboot-vue-management-system.mdx',
    );
  });
});
