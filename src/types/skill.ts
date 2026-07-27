export const skillGroupIds = ['backend', 'frontend', 'data', 'ai'] as const;

export const skillLevels = ['core', 'working', 'exploring'] as const;

export type SkillGroupId = (typeof skillGroupIds)[number];
export type SkillLevel = (typeof skillLevels)[number];
export type SkillAccent = 'backend' | 'frontend' | 'data' | 'ai';

export type SkillItem = Readonly<{
  description: string;
  id: string;
  level: SkillLevel;
  name: string;
  related: readonly string[];
}>;

export type SkillGroup = Readonly<{
  accent: SkillAccent;
  capabilities: readonly string[];
  description: string;
  id: SkillGroupId;
  number: string;
  shortTitle: string;
  skills: readonly SkillItem[];
  title: string;
}>;

export type SkillsSectionContent = Readonly<{
  closingLines: readonly [string, string];
  description: string;
  eyebrow: string;
  flow: readonly string[];
  number: string;
  overviewLabels: readonly [string, string, string];
  overviewDescription: string;
  overviewTitle: string;
  title: string;
}>;
