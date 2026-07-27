import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { HeroBackground } from '../src/components/sections/hero/hero-background';

describe('HeroBackground', () => {
  it('uses the code constellation without rendering the legacy background layers', () => {
    const markup = renderToStaticMarkup(<HeroBackground />);

    expect(markup).toContain('hero-code-constellation');
    expect(markup).not.toContain('hero-static-network');
    expect(markup).not.toContain('hero-scene-loader');
  });
});
