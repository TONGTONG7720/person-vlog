import { describe, expect, it } from 'vitest';

import { heroCodePanels, heroRuntimeModules } from '../src/data/hero-code-constellation';

describe('hero code constellation data', () => {
  it('keeps the four development runtime labels in the intended order', () => {
    expect(heroRuntimeModules.map((module) => module.label)).toEqual([
      'JAVA',
      'PYTHON',
      'VUE',
      'AI',
    ]);
  });

  it('provides compact, syntax-tokenized code panels for the background', () => {
    expect(heroCodePanels).toHaveLength(3);
    expect(heroCodePanels.every((panel) => panel.lines.length >= 3)).toBe(true);
    expect(
      heroCodePanels.flatMap((panel) => panel.lines).some((line) => line.tokens.length > 1),
    ).toBe(true);
  });

  it('keeps Java, Python, and Vue code panels in the visible stack order', () => {
    expect(heroCodePanels.map((panel) => panel.language)).toEqual(['JAVA', 'PYTHON', 'VUE']);
  });
});
