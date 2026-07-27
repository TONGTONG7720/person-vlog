import { z } from 'zod';

import { aiWorkflowNodeKinds } from '@/ai/operating-system/contracts';

const aiWorkflowNodeKindSchema = z.enum(aiWorkflowNodeKinds);

export const aiWorkflowNodeSchema = z
  .object({
    id: z.string().trim().min(1).max(80),
    kind: aiWorkflowNodeKindSchema,
    label: z.string().trim().min(1).max(120),
  })
  .strict();

export const aiWorkflowDefinitionSchema = z
  .object({
    description: z.string().trim().max(500).optional(),
    name: z.string().trim().min(2).max(120),
    nodes: z.array(aiWorkflowNodeSchema).min(2).max(40),
    workspaceId: z.string().trim().min(1).max(128).optional(),
  })
  .strict()
  .superRefine((value, context) => {
    if (!value.nodes.some((node) => node.kind === 'trigger')) {
      context.addIssue({
        code: 'custom',
        message: '工作流必须以至少一个触发节点开始。',
        path: ['nodes'],
      });
    }
  });

export const aiOperatingSystemTaskRequestSchema = z
  .object({
    request: z.string().trim().min(6).max(4_000),
    workflowId: z.string().trim().min(1).max(128).optional(),
    workspaceId: z.string().trim().min(1).max(128),
  })
  .strict();

export const aiOperatingSystemApprovalDecisionSchema = z
  .object({ decision: z.enum(['approve', 'reject']) })
  .strict();

export const aiOperatingSystemApprovalIdSchema = z.string().trim().min(1).max(128);

export type AiOperatingSystemTaskRequest = z.infer<typeof aiOperatingSystemTaskRequestSchema>;
export type AiOperatingSystemApprovalDecision = z.infer<
  typeof aiOperatingSystemApprovalDecisionSchema
>;
export type AiWorkflowDefinition = z.infer<typeof aiWorkflowDefinitionSchema>;
export type AiWorkflowNodeDefinition = z.infer<typeof aiWorkflowNodeSchema>;
