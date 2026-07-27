export const aboutVisualModes = ['backend', 'fullstack', 'automation', 'ai'] as const;

export type AboutVisualMode = (typeof aboutVisualModes)[number];

export type AboutVisualPosition = Readonly<{
  x: number;
  y: number;
}>;

export type AboutStoryStep = Readonly<{
  id: string;
  keywords: readonly string[];
  number: string;
  summary: string;
  title: string;
  visualLabel: string;
  visualMode: AboutVisualMode;
}>;

export type AboutMetric = Readonly<{
  description: string;
  id: string;
  label: string;
  numericValue?: number;
  value: string;
}>;

export type AboutVisualModule = Readonly<{
  activeModes: readonly AboutVisualMode[];
  id: string;
  label: string;
  positions: Readonly<Record<AboutVisualMode, AboutVisualPosition>>;
}>;

export type AboutSectionContent = Readonly<{
  closingLines: readonly [string, string];
  description: string;
  eyebrow: string;
  number: string;
  statementDescription: string;
  statementLines: readonly [string, string];
  title: string;
}>;
