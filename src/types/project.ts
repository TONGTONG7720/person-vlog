export const projectStatuses = ['completed', 'in-progress', 'concept'] as const;

export const projectTypes = ['personal', 'learning', 'client', 'open-source'] as const;

export const projectCategories = [
  'java',
  'python',
  'vue',
  'ai',
  'full-stack',
  'enterprise-system',
  'automation',
  'knowledge-system',
] as const;

export const projectPreviewTypes = [
  'store-dashboard',
  'ai-chat',
  'knowledge-retrieval',
  'digital-delivery',
] as const;

export const projectAccents = ['violet', 'cyan', 'blue', 'amber'] as const;

export type ProjectStatus = (typeof projectStatuses)[number];
export type ProjectType = (typeof projectTypes)[number];
export type ProjectCategory = (typeof projectCategories)[number];
export type ProjectPreviewType = (typeof projectPreviewTypes)[number];
export type ProjectAccent = (typeof projectAccents)[number];

export type Project = {
  readonly accent: ProjectAccent;
  readonly category: readonly [ProjectCategory, ...ProjectCategory[]];
  readonly challenge: string;
  readonly title: string;
  readonly slug: string;
  readonly description: string;
  readonly longDescription?: string;
  readonly previewType: ProjectPreviewType;
  readonly projectType: ProjectType;
  readonly solution: string;
  readonly technologies: readonly string[];
  readonly coverImage?: string;
  readonly gallery?: readonly string[];
  readonly video?: string;
  readonly year: number;
  readonly status: ProjectStatus;
  readonly featured: boolean;
  readonly featuredOrder?: number;
  readonly githubUrl?: string;
  readonly demoUrl?: string;
  readonly result?: string;
};
