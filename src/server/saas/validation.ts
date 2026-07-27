import { z } from 'zod';

export const tenantResourceIdSchema = z.string().trim().min(1).max(64);

export const aiDocumentSourceTypes = ['TEXT', 'MARKDOWN', 'PDF', 'DOCX'] as const;
export const aiWorkspaceRoleKeys = [
  'OWNER',
  'ADMIN',
  'ENTERPRISE_OWNER',
  'SECURITY_ADMIN',
  'DEPARTMENT_ADMIN',
  'MEMBER',
  'VIEWER',
] as const;
export const enterpriseApiScopeValues = [
  'agent.read',
  'agent.execute',
  'knowledge.search',
  'document.upload',
] as const;

const workspaceSlugSchema = z
  .string()
  .trim()
  .min(3)
  .max(80)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/u, 'Slug 只能使用小写字母、数字和连字符。');

export const createWorkspaceSchema = z.object({
  name: z.string().trim().min(2).max(120),
  organizationId: tenantResourceIdSchema,
  slug: workspaceSlugSchema,
});

export const createWorkspaceRequestSchema = createWorkspaceSchema.omit({ organizationId: true });

export const registerSaasAccountSchema = z.object({
  email: z.string().trim().email().max(254),
  organizationName: z.string().trim().min(2).max(120),
  password: z.string().min(8).max(128),
});

export const projectTaskStatusValues = ['TODO', 'DOING', 'REVIEW', 'DONE'] as const;
export const projectTaskPriorityValues = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as const;
export const workspaceProjectStatusValues = [
  'PLANNING',
  'DESIGN',
  'DEVELOPMENT',
  'TESTING',
  'DEPLOY',
  'COMPLETED',
] as const;

export const createWorkspaceProjectSchema = z.object({
  description: z.string().trim().max(4_000).optional(),
  title: z.string().trim().min(2).max(160),
  workspaceId: tenantResourceIdSchema,
});

export const createProjectTaskSchema = z.object({
  assigneeMembershipId: tenantResourceIdSchema.optional(),
  description: z.string().trim().max(4_000).optional(),
  dueDate: z.coerce.date().optional(),
  organizationId: tenantResourceIdSchema,
  priority: z.enum(projectTaskPriorityValues).default('MEDIUM'),
  projectId: tenantResourceIdSchema,
  status: z.enum(projectTaskStatusValues).default('TODO'),
  title: z.string().trim().min(2).max(160),
});

export const createProjectTaskRequestSchema = createProjectTaskSchema.omit({
  organizationId: true,
  projectId: true,
});

export const updateProjectTaskStatusSchema = z.object({
  status: z.enum(projectTaskStatusValues),
});

const projectFileContentTypes = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/zip',
  'image/avif',
  'image/jpeg',
  'image/png',
  'image/webp',
  'text/markdown',
  'text/plain',
] as const;

export const projectFileSchema = z.object({
  contentType: z.enum(projectFileContentTypes),
  fileName: z.string().trim().min(1).max(180),
  size: z
    .number()
    .int()
    .positive()
    .max(20 * 1024 * 1024),
});

export const createProjectDocumentSchema = z.object({
  content: z.string().trim().min(1).max(60_000),
  title: z.string().trim().min(2).max(160),
});

export const projectAssistantRequestSchema = z.object({
  question: z.string().trim().min(1).max(2_000),
});

const aiWorkspaceSlugSchema = z
  .string()
  .trim()
  .min(3)
  .max(80)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/u, 'Slug 只能使用小写字母、数字和连字符。');

export const createAiWorkspaceRequestSchema = z.object({
  description: z.string().trim().max(500).optional(),
  name: z.string().trim().min(2).max(120),
  slug: aiWorkspaceSlugSchema,
});

export const createAiAssistantRequestSchema = z.object({
  description: z.string().trim().max(500).optional(),
  model: z.string().trim().min(2).max(160),
  name: z.string().trim().min(2).max(120),
  similarityThreshold: z.number().min(0).max(1).default(0.12),
  slug: aiWorkspaceSlugSchema,
  systemPrompt: z.string().trim().min(10).max(8_000).optional(),
  temperature: z.number().min(0).max(1.5).default(0.2),
  templateId: tenantResourceIdSchema.optional(),
  topK: z.number().int().min(1).max(12).default(5),
  workspaceId: tenantResourceIdSchema,
});

export const createAiTextDocumentRequestSchema = z.object({
  chunkOverlap: z.number().int().min(0).max(800).default(120),
  chunkSize: z.number().int().min(200).max(2_000).default(800),
  content: z.string().trim().min(1).max(240_000),
  roleKeys: z.array(z.enum(aiWorkspaceRoleKeys)).max(4).default([]),
  sourceType: z.enum(['TEXT', 'MARKDOWN']),
  title: z.string().trim().min(2).max(160),
  workspaceId: tenantResourceIdSchema,
});

export const aiChatRequestSchema = z.object({
  assistantId: tenantResourceIdSchema,
  message: z.string().trim().min(1).max(2_000),
});

export const createAiApiKeyRequestSchema = z.object({
  expiresAt: z.coerce.date().optional(),
  name: z.string().trim().min(2).max(80),
  scopes: z
    .array(z.enum(enterpriseApiScopeValues))
    .min(1)
    .max(4)
    .default(['agent.read', 'agent.execute']),
});

const billingPlanSlugSchema = z
  .string()
  .trim()
  .min(2)
  .max(80)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/u);

export const subscriptionChangeRequestSchema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('checkout'), planSlug: billingPlanSlugSchema }),
  z.object({ action: z.literal('cancel') }),
]);

export type CreateWorkspaceInput = z.infer<typeof createWorkspaceSchema>;
export type CreateProjectTaskInput = z.infer<typeof createProjectTaskSchema>;
export type ProjectFileInput = z.infer<typeof projectFileSchema>;
export type RegisterSaasAccountInput = z.infer<typeof registerSaasAccountSchema>;
export type CreateWorkspaceProjectInput = z.infer<typeof createWorkspaceProjectSchema>;
export type SubscriptionChangeRequest = z.infer<typeof subscriptionChangeRequestSchema>;
export type CreateAiAssistantInput = z.infer<typeof createAiAssistantRequestSchema>;
export type CreateAiTextDocumentInput = z.infer<typeof createAiTextDocumentRequestSchema>;
export type CreateAiWorkspaceInput = z.infer<typeof createAiWorkspaceRequestSchema>;
