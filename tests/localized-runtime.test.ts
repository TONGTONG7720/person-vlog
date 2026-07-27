import { describe, expect, it } from 'vitest';

const runtimeUrl = process.env['LOCAL_RUNTIME_URL'];
const runtimeTest = runtimeUrl ? it : it.skip;

describe('localized runtime rendering', () => {
  runtimeTest(
    'renders Chinese and English home pages without a server component error',
    async () => {
      for (const [pathname, expectedLanguage, expectedText] of [
        ['/', 'zh-CN', 'Java'],
        ['/en', 'en-US', 'Full Stack Developer'],
      ] as const) {
        const response = await fetch(new URL(pathname, runtimeUrl));
        const html = await response.text();

        expect(response.status).toBe(200);
        expect(html).toContain(`lang=\"${expectedLanguage}\"`);
        expect(html).toContain(expectedText);
        expect(html).not.toContain('getLocale` is not supported in Client Components');
      }
    },
  );

  runtimeTest('does not stream React placeholders into no-script fallback content', async () => {
    const response = await fetch(new URL('/en', runtimeUrl));
    const html = await response.text();

    expect(response.status).toBe(200);
    expect(html).not.toMatch(/<noscript>[\s\S]*?<template id="P:/);
  });
});
