export const analyticsEventNames = [
  'page_view',
  'view_project',
  'read_article',
  'view_service',
  'click_contact',
  'submit_contact',
  'use_ai_assistant',
  'article_engagement',
  'content_conversion',
  'project_action',
] as const;

export const contactAnalyticsSources = [
  'hero',
  'services',
  'footer',
  'ai',
  'projects',
  'navigation',
  'contact_cta',
  'direct',
] as const;

export const assistantAnalyticsCategories = [
  'project',
  'service',
  'technology',
  'cooperation',
  'general',
] as const;

export const projectAnalyticsActions = ['github', 'demo', 'contact'] as const;
export const contentConversionTargets = ['project', 'service', 'contact'] as const;
export const pwaAccessModes = ['browser', 'pwa'] as const;

export type AnalyticsEventName = (typeof analyticsEventNames)[number];
export type ContactAnalyticsSource = (typeof contactAnalyticsSources)[number];
export type AssistantAnalyticsCategory = (typeof assistantAnalyticsCategories)[number];
export type ProjectAnalyticsAction = (typeof projectAnalyticsActions)[number];
export type ContentConversionTarget = (typeof contentConversionTargets)[number];
export type PwaAccessMode = (typeof pwaAccessModes)[number];

export type AnalyticsAttribution = Readonly<{
  readonly accessMode?: PwaAccessMode;
  readonly firstCampaign?: string;
  readonly firstMedium?: string;
  readonly firstSource?: string;
  readonly language?: Locale;
}>;

export type AnalyticsEventMetadata = Readonly<{
  readonly article_engagement: AnalyticsAttribution &
    Readonly<{
      readonly completed: boolean;
      readonly durationSeconds: number;
      readonly slug: string;
    }>;
  readonly click_contact: AnalyticsAttribution &
    Readonly<{
      readonly source: ContactAnalyticsSource;
    }>;
  readonly content_conversion: AnalyticsAttribution &
    Readonly<{
      readonly slug: string;
      readonly target: ContentConversionTarget;
      readonly targetId?: string;
    }>;
  readonly page_view: AnalyticsAttribution;
  readonly project_action: AnalyticsAttribution &
    Readonly<{
      readonly action: ProjectAnalyticsAction;
      readonly project: string;
    }>;
  readonly read_article: AnalyticsAttribution &
    Readonly<{
      readonly slug: string;
    }>;
  readonly submit_contact: AnalyticsAttribution &
    Readonly<{
      readonly service: string;
      readonly source?: ContactAnalyticsSource;
    }>;
  readonly use_ai_assistant: AnalyticsAttribution &
    Readonly<{
      readonly category: AssistantAnalyticsCategory;
    }>;
  readonly view_project: AnalyticsAttribution &
    Readonly<{
      readonly project: string;
    }>;
  readonly view_service: AnalyticsAttribution &
    Readonly<{
      readonly service: string;
    }>;
}>;

export type AnalyticsEventPayload = {
  readonly [EventName in AnalyticsEventName]: Readonly<{
    readonly event: EventName;
    readonly metadata: AnalyticsEventMetadata[EventName];
    readonly path: string;
    readonly sessionId: string;
  }>;
}[AnalyticsEventName];
import type { Locale } from '@/types/i18n';
