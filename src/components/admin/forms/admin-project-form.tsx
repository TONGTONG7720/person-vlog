type ProjectFormValues = Readonly<{
  readonly categories?: readonly string[];
  readonly content?: string | null;
  readonly coverImage?: string | null;
  readonly description?: string;
  readonly featured?: boolean;
  readonly id?: string;
  readonly locale?: 'en-US' | 'zh-CN';
  readonly slug?: string;
  readonly status?: 'completed' | 'concept' | 'in-progress';
  readonly technologies?: readonly string[];
  readonly title?: string;
  readonly translationGroup?: string | null;
}>;

type AdminProjectFormProps = Readonly<{
  readonly action: (formData: FormData) => Promise<void>;
  readonly submitLabel: string;
  readonly values?: ProjectFormValues;
}>;

export function AdminProjectForm({
  action,
  submitLabel,
  values = {},
}: AdminProjectFormProps): React.JSX.Element {
  return (
    <form action={action} className="admin-resource-form">
      {values.id === undefined ? null : <input name="id" type="hidden" value={values.id} />}
      <div className="admin-field-grid">
        <label>
          项目标题
          <input
            defaultValue={values.title}
            name="title"
            placeholder="例如：企业知识库 RAG 系统"
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
            placeholder="enterprise-rag-system"
          />
        </label>
      </div>
      <p className="admin-form-hint">
        同一案例的中文与英文内容使用相同翻译组，Slug 可按语言独立设置。
      </p>
      <label>
        一句话简介
        <textarea
          defaultValue={values.description}
          name="description"
          placeholder="说明项目解决的真实问题。"
          required
        />
      </label>
      <div className="admin-field-grid">
        <label>
          分类（逗号分隔）
          <input
            defaultValue={values.categories?.join(', ')}
            name="category"
            placeholder="ai, python, full-stack"
            required
          />
        </label>
        <label>
          技术栈（逗号分隔）
          <input
            defaultValue={values.technologies?.join(', ')}
            name="technologies"
            placeholder="Python, FastAPI, PostgreSQL"
            required
          />
        </label>
      </div>
      <div className="admin-field-grid">
        <label>
          项目状态
          <select defaultValue={values.status ?? 'concept'} name="status">
            <option value="concept">概念验证</option>
            <option value="in-progress">开发中</option>
            <option value="completed">已完成</option>
          </select>
        </label>
        <label>
          封面图片 URL（可选）
          <input
            defaultValue={values.coverImage ?? ''}
            name="coverImage"
            placeholder="https://..."
            type="url"
          />
        </label>
      </div>
      <label>
        案例正文（Markdown，可选）
        <textarea
          className="admin-editor-field"
          defaultValue={values.content ?? ''}
          name="content"
          placeholder="项目背景、挑战、方案、结果和技术架构。"
        />
      </label>
      <label className="admin-checkbox-field">
        <input defaultChecked={values.featured ?? false} name="featured" type="checkbox" />
        在首页精选项目中展示
      </label>
      <button className="admin-primary-button" type="submit">
        {submitLabel}
      </button>
    </form>
  );
}
