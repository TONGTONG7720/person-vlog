import { describe, expect, it } from 'vitest';

import { getHomeServiceModes } from '../src/data/home-preview';

describe('homepage preview data', () => {
  it('keeps three distinct, ordered service modes in both locales', () => {
    for (const locale of ['zh-CN', 'en-US'] as const) {
      const modes = getHomeServiceModes(locale);

      expect(modes.map((mode) => mode.id)).toEqual(['enterprise', 'intelligence', 'mvp']);
      expect(new Set(modes.map((mode) => mode.contactService)).size).toBe(3);
    }
  });
});
