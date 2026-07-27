import { z } from 'zod';

import { contentCategoryIds, contentPlanPriorities, contentPlanStatuses } from '@/config/content';

const adminProjectStatuses = ['completed', 'in-progress', 'concept'] as const;
const adminMessageStatuses = ['unread', 'processing', 'completed', 'archived'] as const;
const adminPostCategories = contentCategoryIds;
const adminContentLocales = ['zh-CN', 'en-US'] as const;
const optionalUrlField = z.string().trim().url('链接必须是有效 URL。').max(2_000).or(z.literal(''));
const optionalShortTextField = z.string().trim().max(500);
const optionalTranslationGroupField = z
  .string()
  .trim()
  .max(80)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/u, '翻译组只能使用小写字母、数字和连字符。')
  .or(z.literal(''));
const contentPlanDateField = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/u, '排期日期必须使用 YYYY-MM-DD 格式。')
  .or(z.literal(''))
  .transform((value, context) => {
    if (value === '') {
      return null;
    }

    const date = new Date(`${value}T00:00:00.000Z`);

    if (Number.isNaN(date.getTime())) {
      context.addIssue({ code: 'custom', message: '排期日期无效。' });

      return z.NEVER;
    }

    return date;
  });

const adminLoginSchema = z.object({
  email: z.string().trim().email('请填写有效的邮箱地址。').max(254),
  password: z.string().min(8, '密码至少需要 8 个字符。').max(128),
});

const adminProjectFormSchema = z.object({
  categories: z.array(z.string().trim().min(1)).min(1, '请至少选择一个项目分类。').max(8),
  content: z.string().trim().max(30_000),
  coverImage: z.string().trim().url('封面地址必须是有效 URL。').max(2_000).or(z.literal('')),
  description: z.string().trim().min(10, '项目简介至少需要 10 个字符。').max(500),
  featured: z.boolean(),
  locale: z.enum(adminContentLocales),
  slug: z
    .string()
    .trim()
    .min(3)
    .max(80)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/u, 'Slug 只能使用小写字母、数字和连字符。'),
  status: z.enum(adminProjectStatuses),
  technologies: z.array(z.string().trim().min(1)).min(1, '请至少填写一项技术。').max(20),
  title: z.string().trim().min(2, '项目标题至少需要 2 个字符。').max(120),
  translationGroup: optionalTranslationGroupField,
});

type AdminProjectFormValue = z.infer<typeof adminProjectFormSchema>;

const adminPostFormSchema = z.object({
  category: z.enum(adminPostCategories),
  content: z.string().trim().min(10, '文章正文至少需要 10 个字符。').max(60_000),
  canonical: optionalUrlField,
  coverImage: optionalUrlField,
  description: z.string().trim().min(10, '文章摘要至少需要 10 个字符。').max(500),
  keywords: z.array(z.string().trim().min(1)).min(1, '请至少填写一个关键词。').max(16),
  locale: z.enum(adminContentLocales),
  ogImage: optionalUrlField,
  published: z.boolean(),
  relatedPosts: z.array(z.string().trim().min(1)).max(12),
  relatedProjects: z.array(z.string().trim().min(1)).max(12),
  relatedServices: z.array(z.string().trim().min(1)).max(12),
  seoDescription: z.string().trim().min(10, 'SEO 描述至少需要 10 个字符。').max(500),
  seoTitle: z.string().trim().min(2, 'SEO 标题至少需要 2 个字符。').max(160),
  slug: z
    .string()
    .trim()
    .min(3)
    .max(80)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/u, 'Slug 只能使用小写字母、数字和连字符。'),
  tags: z.array(z.string().trim().min(1)).min(1, '请至少填写一个标签。').max(12),
  title: z.string().trim().min(2, '文章标题至少需要 2 个字符。').max(160),
  translationGroup: optionalTranslationGroupField,
  socialContent: z.object({
    douyin: optionalShortTextField,
    wechat: optionalShortTextField,
    xiaohongshu: optionalShortTextField,
  }),
});

const adminContentPlanFormSchema = z.object({
  category: z.enum(contentCategoryIds),
  keyword: z.string().trim().min(2, '请填写目标关键词。').max(160),
  locale: z.enum(adminContentLocales),
  notes: z.string().trim().max(3_000),
  priority: z.enum(contentPlanPriorities),
  publishDate: contentPlanDateField,
  status: z.enum(contentPlanStatuses),
  title: z.string().trim().min(2, '请填写内容选题。').max(160),
});

const adminKeywordFormSchema = z.object({
  category: z.enum(contentCategoryIds),
  difficulty: z.string().trim().max(120),
  keyword: z.string().trim().min(2, '请填写关键词。').max(160),
  volume: z.string().trim().max(120),
});

const adminServiceFormSchema = z.object({
  category: z.string().trim().min(2).max(60),
  content: z.string().trim().max(30_000),
  description: z.string().trim().min(10, '服务简介至少需要 10 个字符。').max(1_000),
  featured: z.boolean(),
  locale: z.enum(adminContentLocales),
  slug: z
    .string()
    .trim()
    .min(3)
    .max(80)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/u, 'Slug 只能使用小写字母、数字和连字符。'),
  title: z.string().trim().min(2, '服务标题至少需要 2 个字符。').max(120),
  translationGroup: optionalTranslationGroupField,
});

const adminKnowledgeFormSchema = z.object({
  category: z.string().trim().min(2).max(60),
  content: z.string().trim().min(10, '知识正文至少需要 10 个字符。').max(30_000),
  enabled: z.boolean(),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(80)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/u, 'Slug 只能使用小写字母、数字和连字符。'),
  title: z.string().trim().min(2, '知识标题至少需要 2 个字符。').max(120),
});

const adminSettingFormSchema = z.object({
  key: z
    .string()
    .trim()
    .min(2)
    .max(80)
    .regex(/^[a-z0-9_]+$/u, '设置键只能使用小写字母、数字和下划线。'),
  value: z.string().trim().min(1, '请填写设置内容。').max(5_000),
});

const adminMessageStatusSchema = z.enum(adminMessageStatuses);

type AdminPostFormValue = z.infer<typeof adminPostFormSchema>;
type AdminContentPlanFormValue = z.infer<typeof adminContentPlanFormSchema>;
type AdminKeywordFormValue = z.infer<typeof adminKeywordFormSchema>;
type AdminServiceFormValue = z.infer<typeof adminServiceFormSchema>;
type AdminKnowledgeFormValue = z.infer<typeof adminKnowledgeFormSchema>;
type AdminSettingFormValue = z.infer<typeof adminSettingFormSchema>;
export type AdminMessageStatus = (typeof adminMessageStatuses)[number];

export type AdminProjectFormParseResult =
  | Readonly<{
      readonly kind: 'accepted';
      readonly value: AdminProjectFormValue;
    }>
  | Readonly<{
      readonly kind: 'invalid';
    }>;

type AdminFormParseResult<Value> =
  | Readonly<{
      readonly kind: 'accepted';
      readonly value: Value;
    }>
  | Readonly<{
      readonly kind: 'invalid';
    }>;

function getFormText(formData: FormData, key: string): string {
  const value = formData.get(key);

  return typeof value === 'string' ? value : '';
}

function splitFormList(value: string): string[] {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

export { adminLoginSchema };

export function parseAdminProjectForm(formData: FormData): AdminProjectFormParseResult {
  const parsed = adminProjectFormSchema.safeParse({
    categories: splitFormList(getFormText(formData, 'category')),
    content: getFormText(formData, 'content'),
    coverImage: getFormText(formData, 'coverImage'),
    description: getFormText(formData, 'description'),
    featured: getFormText(formData, 'featured') === 'on',
    locale: getFormText(formData, 'locale'),
    slug: getFormText(formData, 'slug'),
    status: getFormText(formData, 'status'),
    technologies: splitFormList(getFormText(formData, 'technologies')),
    title: getFormText(formData, 'title'),
    translationGroup: getFormText(formData, 'translationGroup'),
  });

  return parsed.success ? { kind: 'accepted', value: parsed.data } : { kind: 'invalid' };
}

export function parseAdminPostForm(formData: FormData): AdminFormParseResult<AdminPostFormValue> {
  const parsed = adminPostFormSchema.safeParse({
    category: getFormText(formData, 'category'),
    content: getFormText(formData, 'content'),
    canonical: getFormText(formData, 'canonical'),
    coverImage: getFormText(formData, 'coverImage'),
    description: getFormText(formData, 'description'),
    keywords: splitFormList(getFormText(formData, 'keywords')),
    locale: getFormText(formData, 'locale'),
    ogImage: getFormText(formData, 'ogImage'),
    published: getFormText(formData, 'published') === 'on',
    relatedPosts: splitFormList(getFormText(formData, 'relatedPosts')),
    relatedProjects: splitFormList(getFormText(formData, 'relatedProjects')),
    relatedServices: splitFormList(getFormText(formData, 'relatedServices')),
    seoDescription: getFormText(formData, 'seoDescription'),
    seoTitle: getFormText(formData, 'seoTitle'),
    slug: getFormText(formData, 'slug'),
    socialContent: {
      douyin: getFormText(formData, 'socialDouyin'),
      wechat: getFormText(formData, 'socialWechat'),
      xiaohongshu: getFormText(formData, 'socialXiaohongshu'),
    },
    tags: splitFormList(getFormText(formData, 'tags')),
    title: getFormText(formData, 'title'),
    translationGroup: getFormText(formData, 'translationGroup'),
  });

  return parsed.success ? { kind: 'accepted', value: parsed.data } : { kind: 'invalid' };
}

export function parseAdminContentPlanForm(
  formData: FormData,
): AdminFormParseResult<AdminContentPlanFormValue> {
  const parsed = adminContentPlanFormSchema.safeParse({
    category: getFormText(formData, 'category'),
    keyword: getFormText(formData, 'keyword'),
    locale: getFormText(formData, 'locale'),
    notes: getFormText(formData, 'notes'),
    priority: getFormText(formData, 'priority'),
    publishDate: getFormText(formData, 'publishDate'),
    status: getFormText(formData, 'status'),
    title: getFormText(formData, 'title'),
  });

  return parsed.success ? { kind: 'accepted', value: parsed.data } : { kind: 'invalid' };
}

export function parseAdminKeywordForm(
  formData: FormData,
): AdminFormParseResult<AdminKeywordFormValue> {
  const parsed = adminKeywordFormSchema.safeParse({
    category: getFormText(formData, 'category'),
    difficulty: getFormText(formData, 'difficulty'),
    keyword: getFormText(formData, 'keyword'),
    volume: getFormText(formData, 'volume'),
  });

  return parsed.success ? { kind: 'accepted', value: parsed.data } : { kind: 'invalid' };
}

export function parseAdminServiceForm(
  formData: FormData,
): AdminFormParseResult<AdminServiceFormValue> {
  const parsed = adminServiceFormSchema.safeParse({
    category: getFormText(formData, 'category'),
    content: getFormText(formData, 'content'),
    description: getFormText(formData, 'description'),
    featured: getFormText(formData, 'featured') === 'on',
    locale: getFormText(formData, 'locale'),
    slug: getFormText(formData, 'slug'),
    title: getFormText(formData, 'title'),
    translationGroup: getFormText(formData, 'translationGroup'),
  });

  return parsed.success ? { kind: 'accepted', value: parsed.data } : { kind: 'invalid' };
}

export function parseAdminKnowledgeForm(
  formData: FormData,
): AdminFormParseResult<AdminKnowledgeFormValue> {
  const parsed = adminKnowledgeFormSchema.safeParse({
    category: getFormText(formData, 'category'),
    content: getFormText(formData, 'content'),
    enabled: getFormText(formData, 'enabled') === 'on',
    slug: getFormText(formData, 'slug'),
    title: getFormText(formData, 'title'),
  });

  return parsed.success ? { kind: 'accepted', value: parsed.data } : { kind: 'invalid' };
}

export function parseAdminSettingForm(
  formData: FormData,
): AdminFormParseResult<AdminSettingFormValue> {
  const parsed = adminSettingFormSchema.safeParse({
    key: getFormText(formData, 'key'),
    value: getFormText(formData, 'value'),
  });

  return parsed.success ? { kind: 'accepted', value: parsed.data } : { kind: 'invalid' };
}

export function parseAdminMessageStatus(value: string): AdminMessageStatus | undefined {
  const parsed = adminMessageStatusSchema.safeParse(value);

  return parsed.success ? parsed.data : undefined;
}
