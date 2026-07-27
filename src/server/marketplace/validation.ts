import { z } from 'zod';

export const marketplaceItemTypeValues = [
  'AGENT',
  'WORKFLOW',
  'PROMPT',
  'TEMPLATE',
  'PLUGIN',
] as const;

export const marketplaceReviewDecisionValues = ['PUBLISHED', 'REJECTED', 'ARCHIVED'] as const;

const marketplaceIdSchema = z.string().trim().min(1).max(64);

const marketplaceSlugSchema = z
  .string()
  .trim()
  .min(3)
  .max(96)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/u, 'Slug 只能使用小写字母、数字和连字符。');

const marketplaceVersionSchema = z
  .string()
  .trim()
  .min(1)
  .max(32)
  .regex(/^v?\d+(?:\.\d+){0,2}(?:-[a-z0-9.-]+)?$/iu, '版本号格式不正确。');

const marketplaceManifestSchema = z.record(z.string(), z.unknown());

export const marketplaceAgentPackageSchema = z.object({
  description: z.string().trim().min(10).max(1_000),
  model: z.string().trim().min(2).max(160),
  name: z.string().trim().min(2).max(120),
  prompt: z.string().trim().min(10).max(8_000),
  tools: z.array(z.string().trim().min(1).max(80)).max(12),
  version: marketplaceVersionSchema,
});

const marketplacePluginSchema = z.object({
  config: marketplaceManifestSchema.default({}),
  permissions: z.array(z.string().trim().min(1).max(80)).min(1).max(8),
  type: z.string().trim().min(2).max(80),
});

export const createMarketplaceItemRequestSchema = z
  .object({
    category: z.string().trim().min(2).max(80),
    changelog: z.string().trim().max(2_000).optional(),
    description: z.string().trim().min(10).max(4_000),
    manifest: marketplaceManifestSchema,
    plugin: marketplacePluginSchema.optional(),
    priceCents: z.number().int().min(0).max(100_000_000).nullable().optional(),
    slug: marketplaceSlugSchema,
    tags: z.array(z.string().trim().min(1).max(48)).max(12).default([]),
    title: z.string().trim().min(2).max(160),
    type: z.enum(marketplaceItemTypeValues),
    version: marketplaceVersionSchema,
  })
  .superRefine((value, context) => {
    if (
      value.type === 'AGENT' &&
      !marketplaceAgentPackageSchema.safeParse(value.manifest).success
    ) {
      context.addIssue({
        code: 'custom',
        message: 'Agent 发布包必须包含名称、描述、提示词、工具、模型和版本。',
        path: ['manifest'],
      });
    }

    if (value.type === 'PLUGIN' && value.plugin === undefined) {
      context.addIssue({
        code: 'custom',
        message: 'Plugin 发布包必须声明类型、配置和最小权限集。',
        path: ['plugin'],
      });
    }

    if (value.type !== 'PLUGIN' && value.plugin !== undefined) {
      context.addIssue({
        code: 'custom',
        message: '只有 Plugin 类型可以提交插件配置。',
        path: ['plugin'],
      });
    }
  });

export const marketplaceItemIdRequestSchema = z.object({ itemId: marketplaceIdSchema });

export const marketplaceItemSubmissionRequestSchema = marketplaceItemIdRequestSchema;

export const marketplaceItemVersionRequestSchema = z.object({
  changelog: z.string().trim().max(2_000).optional(),
  manifest: marketplaceManifestSchema,
  version: marketplaceVersionSchema,
});

export const marketplaceReviewRequestSchema = z.object({
  content: z.string().trim().min(2).max(1_000).optional(),
  itemId: marketplaceIdSchema,
  rating: z.number().int().min(1).max(5),
});

export const marketplaceModerationRequestSchema = z.object({
  reason: z.string().trim().max(1_000).optional(),
  status: z.enum(marketplaceReviewDecisionValues),
});

export const developerAgentChatRequestSchema = z.object({
  agentId: marketplaceIdSchema,
  message: z.string().trim().min(1).max(2_000),
});

export type CreateMarketplaceItemInput = z.infer<typeof createMarketplaceItemRequestSchema>;
export type MarketplaceItemVersionInput = z.infer<typeof marketplaceItemVersionRequestSchema>;
