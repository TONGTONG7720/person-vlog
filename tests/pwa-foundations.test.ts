import { describe, expect, it } from 'vitest';

import {
  PWA_CACHE_NAMES,
  PWA_CACHE_VERSION,
  getPwaRuntimeCacheKind,
  isPwaPublicNavigationPath,
  normalizePwaNavigationPath,
} from '@/lib/pwa';

describe('PWA cache foundations', () => {
  it('uses an app-owned versioned namespace for every runtime cache', () => {
    expect(PWA_CACHE_VERSION).toBe('tong-v1');
    expect(Object.values(PWA_CACHE_NAMES)).toEqual([
      'tong-v1-static',
      'tong-v1-images',
      'tong-v1-pages',
    ]);
  });

  it.each([
    ['/', '/'],
    ['/en/about', '/about'],
    ['/zh-CN/projects/enterprise-rag', '/projects/enterprise-rag'],
    ['/en/blog/rag-retrieval-boundaries', '/blog/rag-retrieval-boundaries'],
  ] as const)('normalizes %s before it is evaluated by the cache policy', (pathname, expected) => {
    expect(normalizePwaNavigationPath(pathname)).toBe(expected);
  });

  it.each([
    '/',
    '/about',
    '/en/projects',
    '/projects/enterprise-rag',
    '/zh-CN/blog/rag-retrieval-boundaries',
  ] as const)('allows public content route %s to use the navigation cache', (pathname) => {
    expect(isPwaPublicNavigationPath(pathname)).toBe(true);
  });

  it.each([
    '/admin',
    '/admin/analytics',
    '/api/assistant',
    '/api/contact',
    '/contact',
    '/offline',
  ] as const)('keeps sensitive or non-content route %s out of the navigation cache', (pathname) => {
    expect(isPwaPublicNavigationPath(pathname)).toBe(false);
  });

  it.each([
    [
      {
        destination: 'script',
        method: 'GET',
        mode: 'no-cors',
        pathname: '/_next/static/chunks/app.js',
        rsc: false,
      },
      'static',
    ],
    [
      {
        destination: 'image',
        method: 'GET',
        mode: 'no-cors',
        pathname: '/icons/icon-512.png',
        rsc: false,
      },
      'images',
    ],
    [
      {
        destination: 'document',
        method: 'GET',
        mode: 'navigate',
        pathname: '/en/blog/rag-retrieval-boundaries',
        rsc: false,
      },
      'pages',
    ],
    [
      {
        destination: '',
        method: 'GET',
        mode: 'cors',
        pathname: '/projects/enterprise-rag',
        rsc: true,
      },
      'pages',
    ],
    [
      {
        destination: 'document',
        method: 'GET',
        mode: 'navigate',
        pathname: '/admin/analytics',
        rsc: false,
      },
      undefined,
    ],
    [
      {
        destination: '',
        method: 'POST',
        mode: 'cors',
        pathname: '/api/contact',
        rsc: false,
      },
      undefined,
    ],
  ] as const)('assigns %j to its safe runtime-cache bucket', (request, expectedCacheKind) => {
    expect(getPwaRuntimeCacheKind(request)).toBe(expectedCacheKind);
  });
});
