import { z } from 'zod';

import {
  aiAppAccessRuleKinds,
  aiAppBlockTypes,
  aiAppEnvironments,
  aiAppLifecycleActions,
  aiAppTypes,
  aiWorkflowCanvasNodeTypes,
} from '@/ai/blocks/contracts';
import { aiWorkspaceRoleKeys, tenantResourceIdSchema } from '@/server/saas/validation';

const aiCanvasPositionSchema = z
  .object({
    x: z.number().finite().min(-10_000).max(10_000),
    y: z.number().finite().min(-10_000).max(10_000),
  })
  .strict();

const aiAppBlockSchema = z
  .object({
    config: z.record(z.string(), z.unknown()).default({}),
    id: z.string().trim().min(1).max(80),
    position: aiCanvasPositionSchema,
    type: z.enum(aiAppBlockTypes),
  })
  .strict();

const aiWorkflowCanvasNodeSchema = z
  .object({
    id: z.string().trim().min(1).max(80),
    label: z.string().trim().min(1).max(120),
    position: aiCanvasPositionSchema,
    type: z.enum(aiWorkflowCanvasNodeTypes),
  })
  .strict();

const aiWorkflowCanvasEdgeSchema = z
  .object({
    id: z.string().trim().min(1).max(100),
    source: z.string().trim().min(1).max(80),
    target: z.string().trim().min(1).max(80),
  })
  .strict();

export const aiAppWorkflowDefinitionSchema = z
  .object({
    edges: z.array(aiWorkflowCanvasEdgeSchema).max(80).default([]),
    nodes: z.array(aiWorkflowCanvasNodeSchema).min(2).max(40),
  })
  .strict()
  .superRefine((workflow, context) => {
    const nodeIds = new Set(workflow.nodes.map((node) => node.id));

    if (!workflow.nodes.some((node) => node.type === 'input')) {
      context.addIssue({
        code: 'custom',
        message: '工作流至少需要一个输入节点。',
        path: ['nodes'],
      });
    }

    if (!workflow.nodes.some((node) => node.type === 'output')) {
      context.addIssue({
        code: 'custom',
        message: '工作流至少需要一个输出节点。',
        path: ['nodes'],
      });
    }

    for (const edge of workflow.edges) {
      if (!nodeIds.has(edge.source) || !nodeIds.has(edge.target)) {
        context.addIssue({
          code: 'custom',
          message: '工作流连接必须指向当前画布中的节点。',
          path: ['edges'],
        });
      }
    }
  });

const aiAppAccessRuleSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal(aiAppAccessRuleKinds[0]) }).strict(),
  z
    .object({ kind: z.literal(aiAppAccessRuleKinds[1]), subject: z.enum(aiWorkspaceRoleKeys) })
    .strict(),
  z.object({ kind: z.literal(aiAppAccessRuleKinds[2]), subject: tenantResourceIdSchema }).strict(),
  z.object({ kind: z.literal(aiAppAccessRuleKinds[3]), subject: tenantResourceIdSchema }).strict(),
]);

const aiAppConfigurationSchema = z
  .object({
    model: z.string().trim().min(2).max(160),
    similarityThreshold: z.number().min(0).max(1).default(0.12),
    systemPrompt: z.string().trim().min(10).max(8_000),
    temperature: z.number().min(0).max(1.5).default(0.2),
    toolKeys: z.array(z.string().trim().min(2).max(120)).max(12).default([]),
    topK: z.number().int().min(1).max(12).default(5),
    welcomeMessage: z.string().trim().min(2).max(500).optional(),
  })
  .strict();

const aiAppSlugSchema = z
  .string()
  .trim()
  .min(3)
  .max(80)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/u, 'Slug 只能使用小写字母、数字和连字符。');

const aiNativeAppRequestBaseSchema = z
  .object({
    accessRules: z
      .array(aiAppAccessRuleSchema)
      .min(1)
      .max(20)
      .default([{ kind: 'ALL_MEMBERS' }]),
    blocks: z.array(aiAppBlockSchema).min(1).max(30),
    config: aiAppConfigurationSchema,
    description: z.string().trim().max(500).optional(),
    name: z.string().trim().min(2).max(120),
    slug: aiAppSlugSchema,
    templateKey: z.string().trim().min(2).max(100).optional(),
    type: z.enum(aiAppTypes),
    workflow: aiAppWorkflowDefinitionSchema,
    workspaceId: tenantResourceIdSchema,
  })
  .strict();

export const createAiNativeAppRequestSchema = aiNativeAppRequestBaseSchema.superRefine(
  (app, context) => {
    const blockIds = new Set<string>();

    for (const block of app.blocks) {
      if (blockIds.has(block.id)) {
        context.addIssue({
          code: 'custom',
          message: '每个 App Block 都需要唯一标识。',
          path: ['blocks'],
        });
      }

      blockIds.add(block.id);
    }

    if (!app.blocks.some((block) => block.type === 'chat' || block.type === 'workflow')) {
      context.addIssue({
        code: 'custom',
        message: 'AI App 至少需要一个对话或工作流区块。',
        path: ['blocks'],
      });
    }
  },
);

export const updateAiNativeAppRequestSchema = aiNativeAppRequestBaseSchema
  .omit({ workspaceId: true })
  .partial()
  .strict();

export const aiNativeAppLifecycleRequestSchema = z
  .object({
    action: z.enum(aiAppLifecycleActions),
    environment: z.enum(aiAppEnvironments).optional(),
    version: z
      .string()
      .trim()
      .regex(/^v\d+(?:\.\d+){0,2}$/u, '版本号需要使用 v1、v1.1 或 v2.0.0 形式。')
      .optional(),
  })
  .strict();

export const aiNativeAppSandboxRequestSchema = z
  .object({ message: z.string().trim().min(1).max(2_000) })
  .strict();

export const aiNativeAppIdSchema = tenantResourceIdSchema;

export type CreateAiNativeAppInput = z.infer<typeof createAiNativeAppRequestSchema>;
export type UpdateAiNativeAppInput = z.infer<typeof updateAiNativeAppRequestSchema>;
export type AiNativeAppLifecycleRequest = z.infer<typeof aiNativeAppLifecycleRequestSchema>;
