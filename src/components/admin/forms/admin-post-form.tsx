import { contentArticleTemplates, contentCategories, type ContentCategory } from '@/config/content';
import { getContentQualityIssues } from '@/lib/blog';

type PostFormValues = Readonly<{
  readonly canonical?: string | null;
  readonly category?: ContentCategory;
  readonly content?: string;
  readonly coverImage?: string | null;
  readonly description?: string;
  readonly id?: string;
  readonly locale?: 'en-US' | 'zh-CN';
  readonly keywords?: readonly string[];
  readonly ogImage?: string | null;
  readonly published?: boolean;
  readonly relatedPosts?: readonly string[];
  readonly relatedProjects?: readonly string[];
  readonly relatedServices?: readonly string[];
  readonly seoDescription?: string | null;
  readonly seoTitle?: string | null;
  readonly slug?: string;
  readonly socialContent?: Readonly<
    Partial<Record<'douyin' | 'wechat' | 'xiaohongshu', string>>
  > | null;
  readonly tags?: readonly string[];
  readonly title?: string;
  readonly translationGroup?: string | null;
}>;

type AdminPostFormProps = Readonly<{
  readonly action: (formData: FormData) => Promise<void>;
  readonly submitLabel: string;
  readonly values?: PostFormValues;
}>;

export function AdminPostForm({
  action,
  submitLabel,
  values = {},
}: AdminPostFormProps): React.JSX.Element {
  const qualityIssues =
    values.content === undefined
      ? []
      : getContentQualityIssues({
          content: values.content,
          description: values.description ?? '',
          keywords: values.keywords ?? [],
          relatedProjects: values.relatedProjects ?? [],
          relatedServices: values.relatedServices ?? [],
          seoDescription: values.seoDescription ?? '',
          seoTitle: values.seoTitle ?? '',
          title: values.title ?? '',
        });

  return (
    <form action={action} className="admin-resource-form">
      {values.id === undefined ? null : <input name="id" type="hidden" value={values.id} />}
      <div className="admin-field-grid">
        <label>
          文章标题
          <input
            defaultValue={values.title}
            name="title"
            placeholder="例如：从零构建企业知识库 RAG 系统"
            required
          />
        </label>
        <label>
          Slug
          <input
            defaultValue={values.slug}
            name="slug"
            placeholder="enterprise-rag-knowledge-base"
            required
          />
        </label>
      </div>
      <div className="admin-field-grid">
        <label>
          内容语言
          <select defaultValue={values.locale ?? 'zh-CN'} name="locale">
            <option value="zh-CN">中文（zh-CN）</option>
            <option value="en-US">English (en-US)</option>
          </select>
        </label>
        <label>
          翻译组（可选）
          <input
            defaultValue={values.translationGroup ?? ''}
            name="translationGroup"
            placeholder="spring-boot-vue-management-system"
          />
        </label>
      </div>
      <p className="admin-form-hint">
        双语文章请使用同一个翻译组；系统会按当前内容语言发布到 / 或 /en。
      </p>
      <label>
        文章摘要
        <textarea
          defaultValue={values.description}
          name="description"
          placeholder="用一两句话说明文章能带来的价值。"
          required
        />
      </label>
      <div className="admin-field-grid">
        <label>
          分类
          <select defaultValue={values.category ?? 'backend'} name="category">
            {contentCategories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          标签（逗号分隔）
          <input
            defaultValue={values.tags?.join(', ')}
            name="tags"
            placeholder="Java, Spring Boot, Architecture"
            required
          />
        </label>
      </div>
      <label>
        核心关键词（逗号分隔）
        <input
          defaultValue={values.keywords?.join(', ')}
          name="keywords"
          placeholder="Spring Boot 企业系统, Vue 管理后台"
          required
        />
      </label>
      <div className="admin-field-grid">
        <label>
          SEO 标题
          <input
            defaultValue={values.seoTitle ?? ''}
            name="seoTitle"
            placeholder="文章在搜索结果中的标题"
            required
          />
        </label>
        <label>
          SEO 描述
          <input
            defaultValue={values.seoDescription ?? ''}
            name="seoDescription"
            placeholder="概括文章解决的问题"
            required
          />
        </label>
      </div>
      <details className="admin-details">
        <summary>文章模板与质量清单</summary>
        <div className="admin-message-details">
          <p>模板只提供写作结构，不会自动生成或发布内容。</p>
          <ul className="admin-template-list">
            {contentArticleTemplates.map((template) => (
              <li key={template.id}>
                <strong>{template.label}</strong>
                <span>{template.outline.join(' → ')}</span>
              </li>
            ))}
          </ul>
          <p>
            发布前确认：摘要、SEO 信息、关键词、一级至三级标题，以及图片的描述性文件名和 Alt 文本。
          </p>
          {qualityIssues.length === 0 ? null : (
            <ul className="admin-quality-issues">
              {qualityIssues.map((issue) => (
                <li key={issue.code}>{issue.message}</li>
              ))}
            </ul>
          )}
        </div>
      </details>
      <label>
        封面图片 URL（可选）
        <input
          defaultValue={values.coverImage ?? ''}
          name="coverImage"
          placeholder="https://..."
          type="url"
        />
      </label>
      <div className="admin-field-grid">
        <label>
          OG 图片 URL（可选）
          <input
            defaultValue={values.ogImage ?? ''}
            name="ogImage"
            placeholder="https://..."
            type="url"
          />
        </label>
        <label>
          Canonical URL（可选）
          <input
            defaultValue={values.canonical ?? ''}
            name="canonical"
            placeholder="https://..."
            type="url"
          />
        </label>
      </div>
      <div className="admin-field-grid">
        <label>
          关联项目 Slug（逗号分隔）
          <input
            defaultValue={values.relatedProjects?.join(', ')}
            name="relatedProjects"
            placeholder="enterprise-rag-knowledge-base"
          />
        </label>
        <label>
          关联服务 Slug（逗号分隔）
          <input
            defaultValue={values.relatedServices?.join(', ')}
            name="relatedServices"
            placeholder="ai-application-development"
          />
        </label>
      </div>
      <label>
        关联文章 Slug（逗号分隔）
        <input
          defaultValue={values.relatedPosts?.join(', ')}
          name="relatedPosts"
          placeholder="maintainable-admin-system"
        />
      </label>
      <label>
        Markdown / MDX 正文
        <textarea
          className="admin-editor-field"
          defaultValue={values.content}
          name="content"
          placeholder={'## 标题\n\n开始写下这篇文章的内容…'}
          required
        />
      </label>
      <details className="admin-details">
        <summary>社交平台改写草稿（可选）</summary>
        <div className="admin-message-details">
          <p>仅保存编辑草稿，发布仍需要在对应平台由人工确认。</p>
          <label>
            小红书
            <textarea
              defaultValue={values.socialContent?.xiaohongshu ?? ''}
              name="socialXiaohongshu"
            />
          </label>
          <label>
            抖音
            <textarea defaultValue={values.socialContent?.douyin ?? ''} name="socialDouyin" />
          </label>
          <label>
            公众号
            <textarea defaultValue={values.socialContent?.wechat ?? ''} name="socialWechat" />
          </label>
        </div>
      </details>
      <label className="admin-checkbox-field">
        <input defaultChecked={values.published ?? false} name="published" type="checkbox" />
        立即发布到公开博客
      </label>
      <button className="admin-primary-button" type="submit">
        {submitLabel}
      </button>
    </form>
  );
}
