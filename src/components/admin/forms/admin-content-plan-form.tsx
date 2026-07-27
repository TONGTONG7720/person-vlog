import {
  contentCategories,
  contentPlanPriorities,
  contentPlanPriorityLabels,
  contentPlanStatusLabels,
  contentPlanStatuses,
  type ContentCategory,
  type ContentPlanPriority,
  type ContentPlanStatus,
} from '@/config/content';

type ContentPlanFormValues = Readonly<{
  readonly category?: ContentCategory;
  readonly id?: string;
  readonly keyword?: string;
  readonly locale?: 'en-US' | 'zh-CN';
  readonly notes?: string | null;
  readonly priority?: ContentPlanPriority;
  readonly publishDate?: Date | null;
  readonly status?: ContentPlanStatus;
  readonly title?: string;
}>;

type AdminContentPlanFormProps = Readonly<{
  readonly action: (formData: FormData) => Promise<void>;
  readonly submitLabel: string;
  readonly values?: ContentPlanFormValues;
}>;

export function AdminContentPlanForm({
  action,
  submitLabel,
  values = {},
}: AdminContentPlanFormProps): React.JSX.Element {
  return (
    <form action={action} className="admin-resource-form">
      {values.id === undefined ? null : <input name="id" type="hidden" value={values.id} />}
      <label>
        内容选题
        <input
          defaultValue={values.title}
          name="title"
          placeholder="例如：企业系统中的权限设计边界"
          required
        />
      </label>
      <div className="admin-field-grid">
        <label>
          内容分类
          <select defaultValue={values.category ?? 'backend'} name="category">
            {contentCategories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          目标关键词
          <input
            defaultValue={values.keyword ?? ''}
            name="keyword"
            placeholder="Spring Boot 权限设计"
            required
          />
        </label>
      </div>
      <label>
        内容语言
        <select defaultValue={values.locale ?? 'zh-CN'} name="locale">
          <option value="zh-CN">中文（zh-CN）</option>
          <option value="en-US">English (en-US)</option>
        </select>
      </label>
      <div className="admin-field-grid">
        <label>
          写作状态
          <select defaultValue={values.status ?? 'idea'} name="status">
            {contentPlanStatuses.map((status) => (
              <option key={status} value={status}>
                {contentPlanStatusLabels[status]}
              </option>
            ))}
          </select>
        </label>
        <label>
          优先级
          <select defaultValue={values.priority ?? 'normal'} name="priority">
            {contentPlanPriorities.map((priority) => (
              <option key={priority} value={priority}>
                {contentPlanPriorityLabels[priority]}
              </option>
            ))}
          </select>
        </label>
      </div>
      <label>
        计划发布日期（可选）
        <input defaultValue={formatDateInput(values.publishDate)} name="publishDate" type="date" />
      </label>
      <label>
        写作备注（可选）
        <textarea
          defaultValue={values.notes ?? ''}
          name="notes"
          placeholder="读者问题、案例边界、可关联的项目或服务。"
        />
      </label>
      <button className="admin-primary-button" type="submit">
        {submitLabel}
      </button>
    </form>
  );
}

function formatDateInput(value: Date | null | undefined): string {
  return value === undefined || value === null ? '' : value.toISOString().slice(0, 10);
}
