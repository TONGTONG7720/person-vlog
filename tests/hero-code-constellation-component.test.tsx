import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { HeroCodeConstellation } from '../src/components/sections/hero/hero-code-constellation';

describe('HeroCodeConstellation', () => {
  it('keeps the ambient runtime modules without rendering a code window', () => {
    const markup = renderToStaticMarkup(<HeroCodeConstellation />);

    expect(markup).toContain('class="hero-code-constellation"');
    expect(markup).toContain('aria-hidden="true"');
    expect(markup).not.toContain('hero-code-window');
    expect(markup).not.toContain('runtime / product.build');
    expect(markup).toContain('JAVA');
    expect(markup).toContain('PYTHON');
    expect(markup).toContain('VUE');
    expect(markup).toContain('AI');
  });
});
