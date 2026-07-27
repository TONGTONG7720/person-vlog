import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

import { defaultLocale, getLocalePath, isLocale, locales, siteTimeZone } from '../src/i18n/config';
import { getHreflangAlternates } from '../src/lib/hreflang';

describe('internationalized routing', () => {
  it('keeps Chinese unprefixed and exposes English beneath /en', () => {
    expect(locales).toEqual(['zh-CN', 'en-US']);
    expect(defaultLocale).toBe('zh-CN');
    expect(getLocalePath('/projects', 'zh-CN')).toBe('/projects');
    expect(getLocalePath('/projects', 'en-US')).toBe('/en/projects');
    expect(getLocalePath('/', 'en-US')).toBe('/en');
  });

  it('only accepts the first-release locales', () => {
    expect(isLocale('zh-CN')).toBe(true);
    expect(isLocale('en-US')).toBe(true);
    expect(isLocale('ja-JP')).toBe(false);
  });

  it('uses one explicit timezone for server and client internationalization', () => {
    expect(siteTimeZone).toBe('Asia/Shanghai');
  });

  it('does not run the locale proxy again for its internal rewrite paths', () => {
    const proxySource = readFileSync(resolve(process.cwd(), 'src/proxy.ts'), 'utf8');

    expect(proxySource).toContain(
      "matcher: ['/((?!api|_next|_vercel|.*\\\\..*|zh-CN(?:/|$)|en-US(?:/|$)).*)']",
    );
  });

  it('creates Chinese, English and default alternates for an indexable route', () => {
    expect(getHreflangAlternates('/blog/rag-knowledge-system')).toEqual({
      'en-US': 'http://localhost:3000/en/blog/rag-knowledge-system',
      'x-default': 'http://localhost:3000/blog/rag-knowledge-system',
      'zh-CN': 'http://localhost:3000/blog/rag-knowledge-system',
    });
  });
});
