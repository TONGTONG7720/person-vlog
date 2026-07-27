# 首页产品化改版 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将首页改为低文字密度、以可交互 UI 承载信息的产品化落地页，同时保留 Ecosystem 与现有独立详情页。

**Architecture:** 首页将使用两组专用预览组件替代与 `/about`、`/services` 完全重复的完整章节；Projects、Blog、Process 与 Ecosystem 收敛为案例轨道、期刊架、步骤管线和公开积累快照。所有内容继续读取现有数据文件，客户端交互只保存当前选择项，不发起网络请求。

**Tech Stack:** Next.js App Router、React 19、TypeScript、Tailwind CSS、既有 Framer Motion / GSAP 基础层、Vitest、Playwright。

## Global Constraints

- 保留首页九个既有章节与 `#ecosystem` 锚点；不删除 Ecosystem。
- `/about` 与 `/services` 保留完整内容；首页只呈现预览和明确详情入口。
- 不新增依赖、外部请求、Canvas、视频或虚构数据。
- 继续复用 `DESIGN.md` 的色彩、间距、响应式、焦点和 reduced-motion 规则。
- 手机端不依赖 Hover，不出现横向页面溢出；交互组件为真实 button/tab/link。
- 验证重点是项目可构建、首页可加载及 375px/768px/1280px 视觉显示。

---

### Task 1: 建立首页预览数据契约

**Files:**

- Create: `src/data/home-preview.ts`
- Create: `tests/home-preview-data.test.ts`

**Interfaces:**

- Consumes: `Locale` from `src/types/i18n.ts` and `Service` identifiers from `src/types/service.ts`.
- Produces: `HomeServiceMode`, `getHomeServiceModes(locale)`, `getHomeAboutPreview(copy)` for home-only presentational components.

- [ ] **Step 1: Write the failing data-contract test**

```ts
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
```

- [ ] **Step 2: Run the focused test and confirm the missing-module failure**

Run: `pnpm vitest run tests/home-preview-data.test.ts`

Expected: FAIL because `src/data/home-preview.ts` does not yet exist.

- [ ] **Step 3: Implement the localised, static preview data**

```ts
export type HomeServiceMode = Readonly<{
  id: 'enterprise' | 'intelligence' | 'mvp';
  number: string;
  title: string;
  description: string;
  signals: readonly string[];
  contactService: 'enterprise' | 'ai' | 'full-stack';
}>;

export function getHomeServiceModes(locale: Locale): readonly HomeServiceMode[] {
  return locale === 'en-US' ? englishHomeServiceModes : chineseHomeServiceModes;
}
```

Use only concise, true statements: enterprise systems; AI/automation; product MVP and iteration. Do not duplicate the six service descriptions or make pricing/timeline claims.

- [ ] **Step 4: Run the focused test and confirm it passes**

Run: `pnpm vitest run tests/home-preview-data.test.ts`

Expected: PASS with one test.

### Task 2: 用首页预览替换重复的 About 与 Services

**Files:**

- Create: `src/components/sections/about/home-about-preview.tsx`
- Create: `src/components/sections/services/home-services-preview.tsx`
- Create: `src/components/sections/services/home-service-mode-switcher.tsx`
- Modify: `src/app/page.tsx`
- Modify: `src/app/globals.css`
- Create: `src/styles/home-previews.css`

**Interfaces:**

- Consumes: `getAboutSectionCopy(locale)`, `getHomeServiceModes(locale)`, `SectionHeading`, `Container`, `Reveal`, and typed i18n `Link`.
- Produces: `HomeAboutPreview` and `HomeServicesPreview`, both rendering their existing homepage anchors (`about`, `services`).

- [ ] **Step 1: Implement `HomeAboutPreview` as a signal rail**

```tsx
export async function HomeAboutPreview(): Promise<React.JSX.Element> {
  const locale = await getRequestLocale();
  const copy = getAboutSectionCopy(locale);
  return (
    <section aria-labelledby="home-about-heading" className="home-about-preview" id="about">
      {/* section title, four ordered story nodes, two compact metrics, /about link */}
    </section>
  );
}
```

Render only each story step number, title and two keywords; keep the prose in `/about`. Use the existing localized `aboutLink` label for the detail action.

- [ ] **Step 2: Implement `HomeServiceModeSwitcher` as accessible tabs**

```tsx
export function HomeServiceModeSwitcher({
  modes,
}: Readonly<{ modes: readonly HomeServiceMode[] }>) {
  const [activeModeId, setActiveModeId] = useState(modes[0]?.id ?? null);
  // role="tablist", real tab buttons, aria-selected and one tabpanel
}
```

Support Enter/Space, ArrowLeft/ArrowRight, Home and End. Each selected panel renders only a short description, three signals and `/contact?service=<contactService>`.

- [ ] **Step 3: Implement `HomeServicesPreview` and compose the two previews on the home route**

```tsx
<HeroSection />
<HomeAboutPreview />
<SkillsSection />
<ProjectsSection />
<HomeServicesPreview />
```

Keep the remaining homepage sequence unchanged. Do not edit `src/app/about/page.tsx` or `src/app/services/page.tsx`, so their existing full versions remain available.

- [ ] **Step 4: Add component CSS using existing tokens only**

Create `home-previews.css` for: desktop signal rail, metric columns, service mode tabs/panel, touch-safe mobile stacking, focus-visible state and reduced-motion transitions. Import it after section styles in `src/app/globals.css`.

### Task 3: 将流程和内容预览收敛为可扫描 UI

**Files:**

- Create: `src/components/sections/process/compact-process-pipeline.tsx`
- Modify: `src/components/sections/process/process-section.tsx`
- Modify: `src/components/sections/projects/projects-section.tsx`
- Modify: `src/components/sections/projects/featured-project-item.tsx`
- Modify: `src/components/sections/blog/blog-section.tsx`
- Modify: `src/components/sections/blog/blog-card.tsx`
- Modify: `src/styles/process.css`
- Modify: `src/styles/projects.css`
- Modify: `src/styles/blog.css`

**Interfaces:**

- Consumes: existing `ProcessStep`, `ProcessUiCopy`, public project/blog data, and existing project/blog routes.
- Produces: a compact process tablist and lower-density project/blog cards without changing public URLs.

- [ ] **Step 1: Implement `CompactProcessPipeline`**

```tsx
export function CompactProcessPipeline({
  steps,
  ui,
}: Readonly<{
  steps: readonly ProcessStep[];
  ui: ProcessUiCopy;
}>): React.JSX.Element {
  // five step tab buttons; selected panel: description + deliverables only
}
```

Use the five existing steps. Remove the homepage-only sticky scroll story and full focus lists from `ProcessSection`; render a normal document-flow pipeline at every breakpoint.

- [ ] **Step 2: Reduce project cards to one proof signal**

Replace the challenge/solution definition list and technology cloud in `FeaturedProjectItem` with the existing concise `project.description`, one labelled solution sentence, preview media and the case-study link. Remove the intro/summary/closing paragraphs in `ProjectsSection` in favor of one small directory link.

- [ ] **Step 3: Turn Blog into a journal shelf**

Keep meta, cover, title and article action. Remove card description and tags from `BlogCard`, plus the verbose intro/closing from `BlogSection`; add a compact `/blog` directory link near the heading.

- [ ] **Step 4: Update styles for the new information density**

Reuse borders, 14px/20px radii, background surfaces and the existing responsive breakpoints. Desktop pipeline may be horizontal at `min-width: 1024px`; it must wrap or become a vertical control list below that breakpoint. No horizontal page scrolling or content hidden behind hover.

### Task 4: 保留并压缩 Ecosystem，收束 Skills 与 Contact 的视觉层级

**Files:**

- Create: `src/components/sections/ecosystem/ecosystem-snapshot.tsx`
- Modify: `src/components/sections/ecosystem/ecosystem-section.tsx`
- Modify: `src/components/sections/skills/skills-overview.tsx`
- Modify: `src/components/sections/skills/skill-group-card.tsx`
- Modify: `src/components/sections/contact/contact-cta.tsx`
- Modify: `src/styles/ecosystem.css`
- Modify: `src/styles/skills.css`
- Modify: `src/styles/contact-cta.css`

**Interfaces:**

- Consumes: existing ecosystem content, enabled social links, empty open-source data, skill groups and existing contact CTA copy.
- Produces: a truthful Build / Write / Connect snapshot, a lighter skills entry point and a visual project-brief CTA.

- [ ] **Step 1: Implement `EcosystemSnapshot`**

```tsx
export function EcosystemSnapshot({
  content,
  links,
  projects,
}: Readonly<{
  content: EcosystemSectionContent;
  links: readonly SocialLink[];
  projects: readonly OpenSourceProject[];
}>): React.JSX.Element {
  // Build / Write / Connect: three status modules; no invented URL or statistics
}
```

When `projects` and `links` are empty, render their existing honest status copy within the corresponding module. Keep the `ecosystem` section and all server-side data ownership.

- [ ] **Step 2: Simplify the Skills entry and tabs**

Keep the existing fully accessible explorer and system map. Make the overview one short product statement + flow; remove repeated technology strings and long descriptions from the selectable cards, leaving detail only in the current panel.

- [ ] **Step 3: Upgrade Contact CTA to a project-brief panel**

Keep the existing title, description and two links. Add a non-interactive three-stage visual rail (`明确目标` / `确定范围` / `开始构建`, localized) inside the same CTA so it looks like a consultation entry rather than another text block. The primary CTA remains the only primary action.

- [ ] **Step 4: Apply a consistent product-surface treatment**

Use existing `canvas-subtle`, `surface-1`, borders, spacing and limited radial lighting. No glass-card cascade, extra gradients, fake dashboards, Github heatmaps, social-wall or continuous animation.

### Task 5: 验证构建与前端显示

**Files:**

- Modify only if a concrete validation failure requires a source fix.

- [ ] **Step 1: Run focused data test and static checks**

Run:

```powershell
pnpm vitest run tests/home-preview-data.test.ts
pnpm typecheck
pnpm lint
```

Expected: exit code 0 for all commands.

- [ ] **Step 2: Build and start/check the production homepage**

Run:

```powershell
pnpm build
Invoke-WebRequest http://127.0.0.1:3000/ -UseBasicParsing
```

Expected: build exits 0 and the homepage responds `200` after the local production server is running.

- [ ] **Step 3: Capture responsive homepage evidence**

Use Playwright against the local homepage at 375px, 768px and 1280px. Check for visible overflow, clipped Chinese headings, unusable tab controls and missing `#ecosystem`; save screenshots under `.omo/evidence/homepage-redesign/`.

- [ ] **Step 4: Report the actual result**

State changed files, the sections now condensed, the exact verification commands/results and any remaining content data the user may later want to fill (real GitHub/social/project media).
