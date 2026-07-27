type ServiceFormValues = Readonly<{
  readonly category?: string;
  readonly content?: string | null;
  readonly description?: string;
  readonly featured?: boolean;
  readonly id?: string;
  readonly locale?: 'en-US' | 'zh-CN';
  readonly slug?: string;
  readonly title?: string;
  readonly translationGroup?: string | null;
}>;

type AdminServiceFormProps = Readonly<{
  readonly action: (formData: FormData) => Promise<void>;
  readonly submitLabel: string;
  readonly values?: ServiceFormValues;
}>;

export function AdminServiceForm({
  action,
  submitLabel,
  values = {},
}: AdminServiceFormProps): React.JSX.Element {
  return (
    <form action={action} className="admin-resource-form">
      {values.id === undefined ? null : <input name="id" type="hidden" value={values.id} />}
      <div className="admin-field-grid">
        <label>
          服务名称
          <input
            defaultValue={values.title}
            name="title"
            placeholder="例如：AI 应用开发"
            required
          />
        </label>
        <label>
          Slug
          <input
            defaultValue={values.slug}
            name="slug"
            placeholder="ai-application-development"
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
            placeholder="ai-application-development"
          />
        </label>
      </div>
      <p className="admin-form-hint">
        同一服务的双语版本应使用相同翻译组，便于在翻译管理页核对完成度。
      </p>
      <div className="admin-field-grid">
        <label>
          服务分类
          <input
            defaultValue={values.category}
            name="category"
            placeholder="ai, enterprise, automation"
            required
          />
        </label>
        <label className="admin-checkbox-field">
          <input defaultChecked={values.featured ?? false} name="featured" type="checkbox" />
          作为首页精选服务
        </label>
      </div>
      <label>
        服务简介
        <textarea
          defaultValue={values.description}
          name="description"
          placeholder="说明适合什么客户以及能解决什么问题。"
          required
        />
      </label>
      <label>
        服务详情（Markdown，可选）
        <textarea
          className="admin-editor-field"
          defaultValue={values.content ?? ''}
          name="content"
          placeholder="交付内容、常见场景、推荐技术与合作流程。"
        />
      </label>
      <button className="admin-primary-button" type="submit">
        {submitLabel}
      </button>
    </form>
  );
}
