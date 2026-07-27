type KnowledgeFormValues = Readonly<{
  readonly category?: string;
  readonly content?: string;
  readonly enabled?: boolean;
  readonly id?: string;
  readonly slug?: string;
  readonly title?: string;
}>;

type AdminKnowledgeFormProps = Readonly<{
  readonly action: (formData: FormData) => Promise<void>;
  readonly submitLabel: string;
  readonly values?: KnowledgeFormValues;
}>;

export function AdminKnowledgeForm({
  action,
  submitLabel,
  values = {},
}: AdminKnowledgeFormProps): React.JSX.Element {
  return (
    <form action={action} className="admin-resource-form">
      {values.id === undefined ? null : <input name="id" type="hidden" value={values.id} />}
      <div className="admin-field-grid">
        <label>
          知识标题
          <input
            defaultValue={values.title}
            name="title"
            placeholder="例如：AI 服务常见问题"
            required
          />
        </label>
        <label>
          Slug
          <input defaultValue={values.slug} name="slug" placeholder="ai-service-faq" required />
        </label>
      </div>
      <label>
        知识分类
        <input
          defaultValue={values.category}
          name="category"
          placeholder="about, project, service, faq, skill"
          required
        />
      </label>
      <label>
        AI 可用知识正文
        <textarea
          className="admin-editor-field"
          defaultValue={values.content}
          name="content"
          placeholder="写下助手可以向访问者说明的、准确且对外公开的信息。"
          required
        />
      </label>
      <label className="admin-checkbox-field">
        <input defaultChecked={values.enabled ?? true} name="enabled" type="checkbox" />
        允许 AI 助手使用这条知识
      </label>
      <button className="admin-primary-button" type="submit">
        {submitLabel}
      </button>
    </form>
  );
}
