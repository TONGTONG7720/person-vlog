export const serviceCategories = [
  'enterprise',
  'ai',
  'automation',
  'full-stack',
  'maintenance',
  'consulting',
] as const;

export const serviceAccents = ['purple', 'cyan', 'blue', 'neutral'] as const;

export type ServiceCategory = (typeof serviceCategories)[number];
export type ServiceAccent = (typeof serviceAccents)[number];

export type ServiceAction = {
  readonly href: string;
  readonly label: string;
};

export type Service = {
  readonly accent: ServiceAccent;
  readonly action: ServiceAction;
  readonly category: ServiceCategory;
  readonly considerations?: readonly string[];
  readonly deliverables: readonly string[];
  readonly description: string;
  readonly eyebrow: string;
  readonly featured: boolean;
  readonly featuredOrder: number;
  readonly id: string;
  readonly number: string;
  readonly problems: readonly string[];
  readonly shortDescription: string;
  readonly slug: string;
  readonly suitableFor: readonly string[];
  readonly technologies: readonly string[];
  readonly title: string;
};

export type ServiceEngagement = {
  readonly description: string;
  readonly number: string;
  readonly title: string;
};

export type ServicesSectionContent = Readonly<{
  readonly closingAction: string;
  readonly closingHelper: string;
  readonly closingLines: readonly [string, string];
  readonly description: string;
  readonly eyebrow: string;
  readonly engagementTitle: readonly [string, string];
  readonly introDetail: string;
  readonly introLines: readonly [string, string];
  readonly number: string;
  readonly technologyNote: string;
  readonly title: string;
}>;
