export const openSourceProjectTypes = ['open-source', 'personal', 'experiment'] as const;
export const openSourceProjectStatuses = ['active', 'archived', 'experiment'] as const;
export const ecosystemActivityIds = ['writing', 'building', 'learning'] as const;

export type OpenSourceProjectType = (typeof openSourceProjectTypes)[number];
export type OpenSourceProjectStatus = (typeof openSourceProjectStatuses)[number];
export type EcosystemActivityId = (typeof ecosystemActivityIds)[number];

export type OpenSourceProject = Readonly<{
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly type: OpenSourceProjectType;
  readonly technologies: readonly string[];
  readonly url?: string;
  readonly githubUrl?: string;
  readonly status: OpenSourceProjectStatus;
  readonly featured: boolean;
}>;

export type DeveloperIdentity = Readonly<{
  readonly name: string;
  readonly role: string;
  readonly technologies: readonly string[];
  readonly statement: string;
  readonly labels: readonly string[];
}>;

export type EcosystemActivity = Readonly<{
  readonly id: EcosystemActivityId;
  readonly title: string;
  readonly description: string;
  readonly topics: readonly string[];
}>;

export type EcosystemSectionContent = Readonly<{
  readonly number: string;
  readonly eyebrow: string;
  readonly titleLines: readonly [string, string, string];
  readonly descriptionLines: readonly [string, string];
  readonly githubTitle: string;
  readonly githubDescription: string;
  readonly identity: DeveloperIdentity;
  readonly projectsTitle: string;
  readonly projectsDescription: string;
  readonly projectsEmptyMessage: string;
  readonly activitiesTitle: string;
  readonly activities: readonly EcosystemActivity[];
  readonly socialTitle: string;
  readonly socialEmptyMessage: string;
  readonly closingLines: readonly [string, string, string];
}>;
