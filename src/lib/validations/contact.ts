import { z } from 'zod';

import { contactBudgets, contactTimelines, type ContactFormData } from '@/types/contact';
import type { Locale } from '@/types/i18n';
import { crmLeadSources } from '@/types/crm';
import { serviceCategories } from '@/types/service';

const minimumContactCompletionMilliseconds = 1_200;
const maximumContactCompletionMilliseconds = 43_200_000;

const contactBudgetSchema = z.union([z.enum(contactBudgets), z.literal('')]);
const contactTimelineSchema = z.union([z.enum(contactTimelines), z.literal('')]);

const contactValidationMessages = {
  'en-US': {
    company: 'Company or team name cannot exceed 100 characters.',
    email: 'Enter a valid email address.',
    emailLength: 'Email address cannot exceed 254 characters.',
    message: 'Describe the project in at least 10 characters.',
    messageLength: 'Project details cannot exceed 2,000 characters.',
    name: 'Enter a name between 2 and 30 characters.',
    nameLength: 'Name cannot exceed 30 characters.',
    service: 'Select a project type.',
  },
  'zh-CN': {
    company: '公司或团队名称不能超过 100 个字符。',
    email: '请填写有效的邮箱地址。',
    emailLength: '联系方式不能超过 254 个字符。',
    message: '请至少描述 10 个字符的项目情况。',
    messageLength: '项目描述不能超过 2000 个字符。',
    name: '请填写 2–30 个字符的称呼。',
    nameLength: '称呼不能超过 30 个字符。',
    service: '请选择项目类型。',
  },
} as const;

export function createContactFormSchema(locale: Locale) {
  const messages = contactValidationMessages[locale];

  return z.object({
    name: z.string().trim().min(2, messages.name).max(30, messages.nameLength),
    email: z.string().trim().email(messages.email).max(254, messages.emailLength),
    company: z.string().trim().max(100, messages.company),
    service: z.enum(serviceCategories, { error: messages.service }),
    budget: contactBudgetSchema,
    timeline: contactTimelineSchema,
    message: z.string().trim().min(10, messages.message).max(2_000, messages.messageLength),
  });
}

export const contactFormSchema = createContactFormSchema('zh-CN');

export const contactSubmissionSchema = contactFormSchema.extend({
  formOpenedAt: z.number().int().nonnegative(),
  source: z.enum(crmLeadSources).optional(),
  website: z.string().trim().max(200),
});

export const contactApiResponseSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('accepted'), message: z.string() }),
  z.object({ kind: z.literal('rejected'), message: z.string() }),
]);

export type ContactFormValues = z.input<typeof contactFormSchema>;

export type ContactSubmissionParseResult =
  | Readonly<{
      readonly data: ContactFormData;
      readonly kind: 'accepted';
    }>
  | Readonly<{
      readonly kind: 'invalid';
    }>
  | Readonly<{
      readonly kind: 'spam';
    }>;

export function parseContactSubmission(
  input: unknown,
  now = Date.now(),
): ContactSubmissionParseResult {
  const parsed = contactSubmissionSchema.safeParse(input);

  if (!parsed.success) {
    return { kind: 'invalid' };
  }

  const elapsed = now - parsed.data.formOpenedAt;

  if (
    parsed.data.website.length > 0 ||
    elapsed < minimumContactCompletionMilliseconds ||
    elapsed > maximumContactCompletionMilliseconds
  ) {
    return { kind: 'spam' };
  }

  return {
    data: {
      email: parsed.data.email,
      message: parsed.data.message,
      name: parsed.data.name,
      service: parsed.data.service,
      ...(parsed.data.company === '' ? {} : { company: parsed.data.company }),
      ...(parsed.data.budget === '' ? {} : { budget: parsed.data.budget }),
      ...(parsed.data.source === undefined ? {} : { source: parsed.data.source }),
      ...(parsed.data.timeline === '' ? {} : { timeline: parsed.data.timeline }),
    },
    kind: 'accepted',
  };
}
