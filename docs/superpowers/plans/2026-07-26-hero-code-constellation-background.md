# Hero Code Constellation Background Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the generic Hero background with a responsive, interactive code-and-data visual that expresses Java, Python, Vue, and AI development capability without competing with Hero content.

**Architecture:** Keep `HeroBackground` as the single client-side coordinator for pointer CSS variables. Add a data-only module for runtime labels and short code fragments, then render those fragments through an aria-hidden `HeroCodeConstellation` presentation component. CSS and SVG own the visual layers, parallax transforms, responsive composition, and reduced-motion behavior; the legacy WebGL scene is removed from the Hero composition.

**Tech Stack:** Next.js 16, React 19, TypeScript, CSS layers/custom properties, Vitest, Playwright browser smoke check.

## Global Constraints

- Do not add dependencies, images, videos, external requests, or canvas rendering.
- Keep Hero title, description, CTA buttons, navigation, and scroll indicator unchanged and readable above the background.
- Background layers must be `aria-hidden` and must not accept pointer events.
- Update pointer positions only with `requestAnimationFrame`; do not put pointer coordinates in React state.
- Desktop has the complete constellation; tablet reduces density; mobile retains one compact code card with two runtime labels.
- Under `prefers-reduced-motion`, remove continuous animation and pointer-driven transforms while preserving a static visual.
- Validate at 375px, 768px, and 1280px with no horizontal overflow.

---

### Task 1: Add typed, reusable Hero code-constellation data

**Files:**

- Create: `src/data/hero-code-constellation.ts`
- Create: `tests/hero-code-constellation-data.test.ts`

**Interfaces:**

- Produces: `HeroRuntimeModule`, `HeroCodeLine`, `heroRuntimeModules`, and `heroCodePanels` for background-only rendering.
- Consumes: no runtime data and no React APIs.

- [x] **Step 1: Write the failing data-contract test**

```ts
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
});
```

- [x] **Step 2: Run the test to verify the missing-module failure**

Run: `pnpm vitest run tests/hero-code-constellation-data.test.ts`

Expected: FAIL because `src/data/hero-code-constellation.ts` does not exist.

- [x] **Step 3: Create the data module**

```ts
export type HeroRuntimeModule = Readonly<{
  label: 'JAVA' | 'PYTHON' | 'VUE' | 'AI';
  status: 'active' | 'ready';
}>;

export type HeroCodeToken = Readonly<{
  tone: 'keyword' | 'type' | 'function' | 'string' | 'plain';
  value: string;
}>;

export type HeroCodeLine = Readonly<{
  tokens: readonly HeroCodeToken[];
}>;

export type HeroCodePanel = Readonly<{
  language: 'JAVA' | 'PYTHON' | 'VUE';
  lines: readonly HeroCodeLine[];
}>;

export const heroRuntimeModules: readonly HeroRuntimeModule[] = [
  { label: 'JAVA', status: 'active' },
  { label: 'PYTHON', status: 'active' },
  { label: 'VUE', status: 'ready' },
  { label: 'AI', status: 'active' },
];

export const heroCodePanels: readonly HeroCodePanel[] = [
  {
    language: 'JAVA',
    lines: [
      {
        tokens: [
          { tone: 'keyword', value: 'public ' },
          { tone: 'type', value: 'record ' },
          { tone: 'function', value: 'Product' },
        ],
      },
      {
        tokens: [
          { tone: 'plain', value: '  ' },
          { tone: 'type', value: 'String' },
          { tone: 'plain', value: ' name' },
        ],
      },
      { tokens: [{ tone: 'plain', value: ') {}' }] },
    ],
  },
  {
    language: 'PYTHON',
    lines: [
      {
        tokens: [
          { tone: 'keyword', value: 'async def ' },
          { tone: 'function', value: 'build' },
          { tone: 'plain', value: '(idea):' },
        ],
      },
      {
        tokens: [
          { tone: 'plain', value: '  return ' },
          { tone: 'string', value: '"shipped"' },
        ],
      },
      {
        tokens: [
          { tone: 'plain', value: '  ' },
          { tone: 'type', value: '# AI ready' },
        ],
      },
    ],
  },
  {
    language: 'VUE',
    lines: [
      {
        tokens: [
          { tone: 'keyword', value: 'const ' },
          { tone: 'function', value: 'product' },
          { tone: 'plain', value: ' = ' },
          { tone: 'function', value: 'ref' },
          { tone: 'plain', value: '()' },
        ],
      },
      {
        tokens: [
          { tone: 'plain', value: '<' },
          { tone: 'type', value: 'Experience' },
          { tone: 'plain', value: ' />' },
        ],
      },
      {
        tokens: [
          { tone: 'plain', value: '// ' },
          { tone: 'string', value: 'make it useful' },
        ],
      },
    ],
  },
];
```

- [x] **Step 4: Run the focused test to verify the data contract**

Run: `pnpm vitest run tests/hero-code-constellation-data.test.ts`

Expected: PASS with 2 tests.

### Task 2: Render the visual layers and wire them into HeroBackground

**Files:**

- Create: `src/components/sections/hero/hero-code-constellation.tsx`
- Modify: `src/components/sections/hero/hero-background.tsx`
- Modify: `src/components/sections/hero/hero-gradient.tsx`
- Modify: `src/styles/hero.css`

**Interfaces:**

- Consumes: `heroRuntimeModules` and `heroCodePanels` from `src/data/hero-code-constellation.ts`.
- Produces: `HeroCodeConstellation`, an `aria-hidden` background presentation component.
- Preserves: `HeroBackground` pointer handling while removing the legacy scene from the rendered composition.

- [x] **Step 1: Add the panel-language assertion to the data contract**

Add this third test to `tests/hero-code-constellation-data.test.ts`:

```ts
it('keeps Java, Python, and Vue code panels in the visible stack order', () => {
  expect(heroCodePanels.map((panel) => panel.language)).toEqual(['JAVA', 'PYTHON', 'VUE']);
});
```

- [x] **Step 2: Run the focused test before changing the visual component**

Run: `pnpm vitest run tests/hero-code-constellation-data.test.ts`

Expected: PASS with 3 tests; this locks the content used by the visual layer.

- [x] **Step 3: Implement `HeroCodeConstellation`**

Render this structure inside an `aria-hidden` wrapper:

```tsx
<div className="hero-code-constellation">
  <div className="hero-code-field" />
  <div className="hero-grid-depth" />
  <div className="hero-code-pulse hero-code-pulse--one" />
  <div className="hero-code-pulse hero-code-pulse--two" />
  <section className="hero-code-window">
    <header className="hero-code-window-header">
      <span>runtime / product.build</span>
      <span>live</span>
    </header>
    <div className="hero-code-window-panels">
      {heroCodePanels.map((panel) => (
        <code className="hero-code-panel" data-language={panel.language} key={panel.language}>
          <span className="hero-code-panel-language">{panel.language}</span>
          {panel.lines.map((line, lineIndex) => (
            <span className="hero-code-line" key={`${panel.language}-${lineIndex}`}>
              {line.tokens.map((token, tokenIndex) => (
                <span data-tone={token.tone} key={`${token.value}-${tokenIndex}`}>
                  {token.value}
                </span>
              ))}
            </span>
          ))}
        </code>
      ))}
    </div>
  </section>
  <div className="hero-runtime-rail">
    {heroRuntimeModules.map((module) => (
      <span className="hero-runtime-module" data-status={module.status} key={module.label}>
        <i />
        {module.label}
      </span>
    ))}
  </div>
</div>
```

Use `<code>` and token `<span data-tone={token.tone}>` elements only for visual styling. Do not render terminal controls that look clickable and do not introduce interactive focus targets.

- [x] **Step 4: Replace the generic fallback placement and extend gradient layers**

In `HeroBackground`, place `<HeroCodeConstellation />` after `<HeroGradient />` and before `<HeroSceneLoader />`. Remove `SceneFallback` from this background path so the old generic SVG network no longer competes with the code visual.

In `HeroGradient`, retain the gradient, grid, and noise nodes; add a `hero-grid-depth` element for the perspective floor.

- [x] **Step 5: Add scoped Hero CSS**

Add only `.hero-*` classes in `src/styles/hero.css`:

- code window gets a low-opacity glass surface, 1px border, slight rotate/translate based on `--hero-pointer-x` and `--hero-pointer-y`;
- code field and depth grid get lower opacity and separate transform multipliers;
- runtime rail shows four compact labels and active dots;
- code token tones use the existing cyan, violet, and muted palette;
- data pulses animate only within `(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)`;
- mobile hides the runtime labels after the first two and shifts the code card below the content-safe area;
- reduced motion removes all keyframe animation and parallax transforms.

- [x] **Step 6: Run static checks**

Run: `pnpm typecheck`

Expected: exit code 0.

Run: `pnpm lint`

Expected: exit code 0.

Run: `pnpm format:check`

Expected: exit code 0.

### Task 3: Verify responsive presentation and interactions in a browser

**Files:**

- Modify: `docs/superpowers/plans/2026-07-26-hero-code-constellation-background.md` (mark completed checkboxes only)

**Interfaces:**

- Consumes: the running production build at `http://127.0.0.1:3000/`.
- Produces: visual evidence under `.omo/evidence/hero-code-constellation/`.

- [x] **Step 1: Build the production app**

Run: `pnpm build`

Expected: Next.js completes successfully.

- [x] **Step 2: Start or restart the production server on port 3000**

Run: `pnpm exec next start -p 3000`

Expected: `http://127.0.0.1:3000/` returns HTTP 200.

- [x] **Step 3: Drive the real homepage with Playwright**

At 375px, 768px, and 1280px, load `/` with reduced motion enabled and assert:

```ts
expect(await page.locator('.hero-code-window').count()).toBe(1);
expect(await page.locator('.hero-runtime-module').count()).toBe(4);
expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
  true,
);
```

At 1280px with normal motion, move the mouse within `#hero` and assert that `--hero-pointer-x` changes on `.hero-background`.

- [x] **Step 4: Capture screenshots and confirm readability**

Save `hero-375.png`, `hero-768.png`, and `hero-1280.png` under `.omo/evidence/hero-code-constellation/`. Confirm that the primary heading, description, and CTA buttons remain readable and unobstructed.

- [x] **Step 5: Run the full unit suite**

Run: `pnpm test`

Expected: exit code 0 with no failed test files.
