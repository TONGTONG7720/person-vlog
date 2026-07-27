import { describe, expect, it } from 'vitest';

import { GET } from '../src/app/rss.xml/route';

describe('博客 RSS', () => {
  it('输出公开文章的标准 RSS 文档', async () => {
    const response = await GET();
    const body = await response.text();

    expect(response.headers.get('content-type')).toContain('application/rss+xml');
    expect(body).toContain('<rss version="2.0">');
    expect(body).toContain('Spring Boot + Vue 企业管理系统开发完整记录');
    expect(body).toContain('/blog/springboot-vue-management-system');
  });
});
