import { describe, expect, it } from 'vitest';

import { isPlatformPublicRoute } from '../src/i18n/platform-public-routes';

describe('公开平台路由边界', () => {
  it('让根级 Marketplace 与开发者入口绕过 locale 重写', () => {
    expect(isPlatformPublicRoute('/marketplace')).toBe(true);
    expect(isPlatformPublicRoute('/marketplace/customer-support-agent')).toBe(true);
    expect(isPlatformPublicRoute('/developer')).toBe(true);
    expect(isPlatformPublicRoute('/developers/docs')).toBe(true);
    expect(isPlatformPublicRoute('/app-marketplace')).toBe(true);
    expect(isPlatformPublicRoute('/app/customer-support')).toBe(true);
  });

  it('不扩大到已有国际化内容页或相似路径', () => {
    expect(isPlatformPublicRoute('/blog')).toBe(false);
    expect(isPlatformPublicRoute('/marketplaces')).toBe(false);
    expect(isPlatformPublicRoute('/developers-community')).toBe(false);
    expect(isPlatformPublicRoute('/apps/customer-support')).toBe(false);
  });
});
