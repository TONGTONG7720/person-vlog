import { z } from 'zod';

import {
  assistantAnalyticsCategories,
  contactAnalyticsSources,
  contentConversionTargets,
  pwaAccessModes,
  projectAnalyticsActions,
} from '@/types/analytics';

const trackingValuePattern = /^[\p{L}\p{N}][\p{L}\p{N}._-]*$/u;
const safePathPattern = /^\/(?!\/)[a-zA-Z0-9/_-]*$/;

const trackingValueSchema = z.string().trim().min(1).max(80).regex(trackingValuePattern);

const analyticsPathSchema = z.string().min(1).max(240).regex(safePathPattern);
const analyticsSessionIdSchema = z.string().uuid();
const analyticsIdentifierSchema = z.string().trim().min(1).max(120).regex(trackingValuePattern);

const attributionSchema = z
  .object({
    accessMode: z.enum(pwaAccessModes).optional(),
    firstCampaign: trackingValueSchema.optional(),
    firstMedium: trackingValueSchema.optional(),
    firstSource: trackingValueSchema.optional(),
    language: z.enum(['zh-CN', 'en-US']).optional(),
  })
  .strict();

const pageViewMetadataSchema = attributionSchema;
const projectViewMetadataSchema = attributionSchema
  .extend({ project: analyticsIdentifierSchema })
  .strict();
const articleReadMetadataSchema = attributionSchema
  .extend({ slug: analyticsIdentifierSchema })
  .strict();
const serviceViewMetadataSchema = attributionSchema
  .extend({ service: analyticsIdentifierSchema })
  .strict();
const contactClickMetadataSchema = attributionSchema
  .extend({ source: z.enum(contactAnalyticsSources) })
  .strict();
const contactSubmissionMetadataSchema = attributionSchema
  .extend({
    service: analyticsIdentifierSchema,
    source: z.enum(contactAnalyticsSources).optional(),
  })
  .strict();
const assistantUsageMetadataSchema = attributionSchema
  .extend({ category: z.enum(assistantAnalyticsCategories) })
  .strict();
const articleEngagementMetadataSchema = attributionSchema
  .extend({
    completed: z.boolean(),
    durationSeconds: z.number().int().min(0).max(3_600),
    slug: analyticsIdentifierSchema,
  })
  .strict();
const projectActionMetadataSchema = attributionSchema
  .extend({
    action: z.enum(projectAnalyticsActions),
    project: analyticsIdentifierSchema,
  })
  .strict();
const contentConversionMetadataSchema = attributionSchema
  .extend({
    slug: analyticsIdentifierSchema,
    target: z.enum(contentConversionTargets),
    targetId: analyticsIdentifierSchema.optional(),
  })
  .strict();

const requestShape = {
  path: analyticsPathSchema,
  sessionId: analyticsSessionIdSchema,
} as const;

export const analyticsRequestSchema = z.discriminatedUnion('event', [
  z
    .object({ ...requestShape, event: z.literal('page_view'), metadata: pageViewMetadataSchema })
    .strict(),
  z
    .object({
      ...requestShape,
      event: z.literal('view_project'),
      metadata: projectViewMetadataSchema,
    })
    .strict(),
  z
    .object({
      ...requestShape,
      event: z.literal('read_article'),
      metadata: articleReadMetadataSchema,
    })
    .strict(),
  z
    .object({
      ...requestShape,
      event: z.literal('view_service'),
      metadata: serviceViewMetadataSchema,
    })
    .strict(),
  z
    .object({
      ...requestShape,
      event: z.literal('click_contact'),
      metadata: contactClickMetadataSchema,
    })
    .strict(),
  z
    .object({
      ...requestShape,
      event: z.literal('submit_contact'),
      metadata: contactSubmissionMetadataSchema,
    })
    .strict(),
  z
    .object({
      ...requestShape,
      event: z.literal('use_ai_assistant'),
      metadata: assistantUsageMetadataSchema,
    })
    .strict(),
  z
    .object({
      ...requestShape,
      event: z.literal('article_engagement'),
      metadata: articleEngagementMetadataSchema,
    })
    .strict(),
  z
    .object({
      ...requestShape,
      event: z.literal('content_conversion'),
      metadata: contentConversionMetadataSchema,
    })
    .strict(),
  z
    .object({
      ...requestShape,
      event: z.literal('project_action'),
      metadata: projectActionMetadataSchema,
    })
    .strict(),
]);

export type AnalyticsRequest = z.infer<typeof analyticsRequestSchema>;
