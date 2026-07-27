import { z } from 'zod';

import {
  crmLeadActivityTypes,
  crmLeadPriorities,
  crmLeadSources,
  crmLeadStatuses,
  crmLeadTags,
  crmProjectStatuses,
  crmProposalStatuses,
  crmTaskStatuses,
} from '@/types/crm';

const resourceIdSchema = z.string().trim().min(1).max(64);
const optionalShortTextSchema = z.string().trim().max(160).optional();
const optionalLongTextSchema = z.string().trim().max(4_000).optional();
const optionalDateSchema = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/u, '日期格式必须为 YYYY-MM-DD。')
  .transform((value, context) => {
    const parsedDate = new Date(`${value}T00:00:00.000Z`);

    if (Number.isNaN(parsedDate.getTime())) {
      context.addIssue({ code: 'custom', message: '日期无效。' });

      return z.NEVER;
    }

    return parsedDate;
  })
  .optional();

const createLeadSchema = z.object({
  budget: optionalShortTextSchema,
  company: optionalShortTextSchema,
  email: z.string().trim().email('请填写有效的邮箱地址。').max(254),
  name: z.string().trim().min(2, '请填写联系人称呼。').max(80),
  notes: optionalLongTextSchema,
  priority: z.enum(crmLeadPriorities),
  service: optionalShortTextSchema,
  source: z.enum(crmLeadSources).optional(),
  tags: z.array(z.enum(crmLeadTags)).max(crmLeadTags.length),
  timeline: optionalShortTextSchema,
});

const leadStatusSchema = z.object({
  id: resourceIdSchema,
  status: z.enum(crmLeadStatuses),
});

const leadActivitySchema = z.object({
  content: z.string().trim().min(2, '请填写活动记录。').max(4_000),
  leadId: resourceIdSchema,
  type: z.enum(crmLeadActivityTypes),
});

const createTaskSchema = z.object({
  dueDate: optionalDateSchema,
  leadId: resourceIdSchema.optional(),
  title: z.string().trim().min(2, '请填写任务标题。').max(160),
});

const taskStatusSchema = z.object({
  id: resourceIdSchema,
  status: z.enum(crmTaskStatuses),
});

const createProjectSchema = z.object({
  description: optionalLongTextSchema,
  dueDate: optionalDateSchema,
  leadId: resourceIdSchema.optional(),
  title: z.string().trim().min(2, '请填写项目名称。').max(160),
});

const projectStatusSchema = z.object({
  id: resourceIdSchema,
  status: z.enum(crmProjectStatuses),
});

const createProposalSchema = z.object({
  content: z.string().trim().min(10, '请填写方案或报价说明。').max(12_000),
  leadId: resourceIdSchema,
  title: z.string().trim().min(2, '请填写方案标题。').max(160),
});

const proposalStatusSchema = z.object({
  id: resourceIdSchema,
  status: z.enum(crmProposalStatuses),
});

const automationRuleSchema = z.object({
  enabled: z.boolean(),
  id: resourceIdSchema,
});

export type CrmFormResult<Value> =
  | Readonly<{ readonly kind: 'accepted'; readonly value: Value }>
  | Readonly<{ readonly kind: 'invalid' }>;

export function getCrmResourceId(formData: FormData): string | undefined {
  const parsed = resourceIdSchema.safeParse(getFormText(formData, 'id'));

  return parsed.success ? parsed.data : undefined;
}

export function parseCrmCreateLeadForm(
  formData: FormData,
): CrmFormResult<z.infer<typeof createLeadSchema>> {
  return parseForm(createLeadSchema, {
    budget: getOptionalText(formData, 'budget'),
    company: getOptionalText(formData, 'company'),
    email: getFormText(formData, 'email'),
    name: getFormText(formData, 'name'),
    notes: getOptionalLongText(formData, 'notes'),
    priority: getFormText(formData, 'priority'),
    service: getOptionalText(formData, 'service'),
    source: getOptionalText(formData, 'source'),
    tags: splitFormList(getFormText(formData, 'tags')),
    timeline: getOptionalText(formData, 'timeline'),
  });
}

export function parseCrmLeadStatusForm(
  formData: FormData,
): CrmFormResult<z.infer<typeof leadStatusSchema>> {
  return parseForm(leadStatusSchema, {
    id: getFormText(formData, 'id'),
    status: getFormText(formData, 'status'),
  });
}

export function parseCrmLeadActivityForm(
  formData: FormData,
): CrmFormResult<z.infer<typeof leadActivitySchema>> {
  return parseForm(leadActivitySchema, {
    content: getFormText(formData, 'content'),
    leadId: getFormText(formData, 'leadId'),
    type: getFormText(formData, 'type'),
  });
}

export function parseCrmCreateTaskForm(
  formData: FormData,
): CrmFormResult<z.infer<typeof createTaskSchema>> {
  return parseForm(createTaskSchema, {
    dueDate: getOptionalText(formData, 'dueDate'),
    leadId: getOptionalText(formData, 'leadId'),
    title: getFormText(formData, 'title'),
  });
}

export function parseCrmTaskStatusForm(
  formData: FormData,
): CrmFormResult<z.infer<typeof taskStatusSchema>> {
  return parseForm(taskStatusSchema, {
    id: getFormText(formData, 'id'),
    status: getFormText(formData, 'status'),
  });
}

export function parseCrmCreateProjectForm(
  formData: FormData,
): CrmFormResult<z.infer<typeof createProjectSchema>> {
  return parseForm(createProjectSchema, {
    description: getOptionalLongText(formData, 'description'),
    dueDate: getOptionalText(formData, 'dueDate'),
    leadId: getOptionalText(formData, 'leadId'),
    title: getFormText(formData, 'title'),
  });
}

export function parseCrmProjectStatusForm(
  formData: FormData,
): CrmFormResult<z.infer<typeof projectStatusSchema>> {
  return parseForm(projectStatusSchema, {
    id: getFormText(formData, 'id'),
    status: getFormText(formData, 'status'),
  });
}

export function parseCrmCreateProposalForm(
  formData: FormData,
): CrmFormResult<z.infer<typeof createProposalSchema>> {
  return parseForm(createProposalSchema, {
    content: getFormText(formData, 'content'),
    leadId: getFormText(formData, 'leadId'),
    title: getFormText(formData, 'title'),
  });
}

export function parseCrmProposalStatusForm(
  formData: FormData,
): CrmFormResult<z.infer<typeof proposalStatusSchema>> {
  return parseForm(proposalStatusSchema, {
    id: getFormText(formData, 'id'),
    status: getFormText(formData, 'status'),
  });
}

export function parseCrmAutomationRuleForm(
  formData: FormData,
): CrmFormResult<z.infer<typeof automationRuleSchema>> {
  return parseForm(automationRuleSchema, {
    enabled: getFormText(formData, 'enabled') === 'on',
    id: getFormText(formData, 'id'),
  });
}

function getFormText(formData: FormData, key: string): string {
  const value = formData.get(key);

  return typeof value === 'string' ? value : '';
}

function getOptionalText(formData: FormData, key: string): string | undefined {
  const value = getFormText(formData, key).trim();

  return value === '' ? undefined : value;
}

function getOptionalLongText(formData: FormData, key: string): string | undefined {
  const value = getFormText(formData, key).trim();

  return value === '' ? undefined : value;
}

function parseForm<Schema extends z.ZodType>(
  schema: Schema,
  input: unknown,
): CrmFormResult<z.output<Schema>> {
  const parsed = schema.safeParse(input);

  return parsed.success ? { kind: 'accepted', value: parsed.data } : { kind: 'invalid' };
}

function splitFormList(value: string): string[] {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}
