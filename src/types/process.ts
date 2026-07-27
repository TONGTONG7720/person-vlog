export const processVisualStates = [
  'idea',
  'structure',
  'design',
  'development',
  'deployment',
] as const;

export type ProcessVisualState = (typeof processVisualStates)[number];

export type ProcessStep = Readonly<{
  description: string;
  deliverables: readonly string[];
  eyebrow: string;
  focus: readonly string[];
  icon?: string;
  id: ProcessVisualState;
  number: string;
  title: string;
  visualState: ProcessVisualState;
}>;

export type ProcessVisualLayer = Readonly<{
  code: string;
  label: string;
  modules: readonly string[];
  visualState: ProcessVisualState;
}>;

export type ProcessSectionContent = Readonly<{
  closingAction: string;
  closingHelper: string;
  closingLines: readonly [string, string, string, string];
  description: string;
  eyebrow: string;
  introDescription: string;
  introLines: readonly [string, string];
  number: string;
  title: string;
  visualFooter: string;
  visualTitle: string;
}>;
