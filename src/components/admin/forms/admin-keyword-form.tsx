import { contentCategories, type ContentCategory } from '@/config/content';

type KeywordFormValues = Readonly<{
  readonly category?: ContentCategory;
  readonly difficulty?: string | null;
  readonly keyword?: string;
  readonly volume?: string | null;
}>;

type AdminKeywordFormProps = Readonly<{
  readonly action: (formData: FormData) => Promise<void>;
  readonly submitLabel: string;
  readonly values?: KeywordFormValues;
}>;

export function AdminKeywordForm({
  action,
  submitLabel,
  values = {},
}: AdminKeywordFormProps): React.JSX.Element {
  return (
    <form action={action} className="admin-resource-form">
      <div className="admin-field-grid">
        <label>
          关键词
          <input
            defaultValue={values.keyword}
            name="keyword"
            placeholder="企业 RAG 知识库"
            required
          />
        </label>
        <label>
          内容分类
          <select defaultValue={values.category ?? 'ai'} name="category">
            {contentCategories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <label>
        搜索难度（可选）
        <input
          defaultValue={values.difficulty ?? ''}
          name="difficulty"
          placeholder="低 / 中 / 高，或第三方工具评分"
        />
      </label>
      <label>
        搜索量（可选）
        <input defaultValue={values.volume ?? ''} name="volume" placeholder="例如：1k - 5k / 月" />
      </label>
      <button className="admin-secondary-button" type="submit">
        {submitLabel}
      </button>
    </form>
  );
}
