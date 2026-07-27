import { z } from 'zod';

const aiProviderIds = ['openai', 'anthropic', 'gemini', 'local'] as const;
const resourceIdSchema = z.string().trim().min(1).max(64);
const optionalResourceIdSchema = resourceIdSchema.optional();
const topicSchema = z.string().trim().min(2).max(500);
const meetingContentSchema = z.string().trim().min(10).max(20_000);
type MeetingWorkflowForm = Readonly<
  { readonly content: string } | { readonly content: string; readonly leadId: string }
>;
const meetingWorkflowSchema = z
  .object({ content: meetingContentSchema, leadId: optionalResourceIdSchema })
  .transform(({ content, leadId }): MeetingWorkflowForm =>
    leadId === undefined ? { content } : { content, leadId },
  );
const modelConfigSchema = z.object({
  dailyLimit: z.number().int().min(1_000).max(10_000_000).nullable(),
  maxTokens: z.number().int().min(128).max(8_000),
  model: z.string().trim().min(2).max(160),
  monthlyLimit: z.number().int().min(1_000).max(100_000_000).nullable(),
  priority: z.number().int().min(1).max(999),
  provider: z.enum(aiProviderIds),
});
const promptSchema = z.object({
  content: z.string().trim().min(10).max(8_000),
  name: z
    .string()
    .trim()
    .regex(/^[a-z][a-z-]{1,48}$/u),
});
const toggleSchema = z.object({
  enabled: z.boolean(),
  id: resourceIdSchema,
});

export type AiFormResult<Value> =
  | Readonly<{ readonly kind: 'accepted'; readonly value: Value }>
  | Readonly<{ readonly kind: 'invalid' }>;

export function parseAiLeadWorkflowForm(
  formData: FormData,
): AiFormResult<{ readonly leadId: string }> {
  return parseForm(z.object({ leadId: resourceIdSchema }), { leadId: getText(formData, 'leadId') });
}

export function parseAiProposalWorkflowForm(
  formData: FormData,
): AiFormResult<{ readonly leadId: string }> {
  return parseForm(z.object({ leadId: resourceIdSchema }), { leadId: getText(formData, 'leadId') });
}

export function parseAiProjectWorkflowForm(
  formData: FormData,
): AiFormResult<{ readonly projectId: string }> {
  return parseForm(z.object({ projectId: resourceIdSchema }), {
    projectId: getText(formData, 'projectId'),
  });
}

export function parseAiKnowledgeWorkflowForm(
  formData: FormData,
): AiFormResult<{ readonly projectId: string }> {
  return parseForm(z.object({ projectId: resourceIdSchema }), {
    projectId: getText(formData, 'projectId'),
  });
}

export function parseAiContentWorkflowForm(
  formData: FormData,
): AiFormResult<{ readonly topic: string }> {
  return parseForm(z.object({ topic: topicSchema }), { topic: getText(formData, 'topic') });
}

export function parseAiMeetingWorkflowForm(formData: FormData): AiFormResult<MeetingWorkflowForm> {
  return parseForm(meetingWorkflowSchema, {
    content: getText(formData, 'content'),
    leadId: getOptionalText(formData, 'leadId'),
  });
}

export function parseAiModelConfigForm(
  formData: FormData,
): AiFormResult<z.output<typeof modelConfigSchema>> {
  return parseForm(modelConfigSchema, {
    dailyLimit: getOptionalNumber(formData, 'dailyLimit'),
    maxTokens: getNumber(formData, 'maxTokens'),
    model: getText(formData, 'model'),
    monthlyLimit: getOptionalNumber(formData, 'monthlyLimit'),
    priority: getNumber(formData, 'priority'),
    provider: getText(formData, 'provider'),
  });
}

export function parseAiPromptForm(formData: FormData): AiFormResult<z.output<typeof promptSchema>> {
  return parseForm(promptSchema, {
    content: getText(formData, 'content'),
    name: getText(formData, 'name'),
  });
}

export function parseAiToggleForm(formData: FormData): AiFormResult<z.output<typeof toggleSchema>> {
  return parseForm(toggleSchema, {
    enabled: getText(formData, 'enabled') === 'on',
    id: getText(formData, 'id'),
  });
}

export function parseAiProjectPlanApprovalForm(
  formData: FormData,
): AiFormResult<{ readonly id: string }> {
  return parseForm(z.object({ id: resourceIdSchema }), { id: getText(formData, 'id') });
}

export function parseAiContentDraftReviewForm(
  formData: FormData,
): AiFormResult<{ readonly id: string }> {
  return parseForm(z.object({ id: resourceIdSchema }), { id: getText(formData, 'id') });
}

function getText(formData: FormData, name: string): string {
  const value = formData.get(name);

  return typeof value === 'string' ? value : '';
}

function getOptionalText(formData: FormData, name: string): string | undefined {
  const value = getText(formData, name).trim();

  return value === '' ? undefined : value;
}

function getNumber(formData: FormData, name: string): number {
  return Number(getText(formData, name));
}

function getOptionalNumber(formData: FormData, name: string): number | null {
  const value = getOptionalText(formData, name);

  return value === undefined ? null : Number(value);
}

function parseForm<Schema extends z.ZodType>(
  schema: Schema,
  input: unknown,
): AiFormResult<z.output<Schema>> {
  const parsed = schema.safeParse(input);

  return parsed.success ? { kind: 'accepted', value: parsed.data } : { kind: 'invalid' };
}
