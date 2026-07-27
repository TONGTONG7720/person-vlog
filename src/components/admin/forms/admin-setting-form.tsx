type SettingFormValues = Readonly<{
  readonly key?: string;
  readonly value?: string;
}>;

type AdminSettingFormProps = Readonly<{
  readonly action: (formData: FormData) => Promise<void>;
  readonly submitLabel: string;
  readonly values?: SettingFormValues;
}>;

export function AdminSettingForm({
  action,
  submitLabel,
  values = {},
}: AdminSettingFormProps): React.JSX.Element {
  return (
    <form action={action} className="admin-resource-form">
      <label>
        设置键
        <input defaultValue={values.key} name="key" placeholder="site_title" required />
      </label>
      <label>
        设置值
        <textarea
          defaultValue={values.value}
          name="value"
          placeholder="例如：瞳瞳｜全栈开发者与 AI 应用开发"
          required
        />
      </label>
      <button className="admin-primary-button" type="submit">
        {submitLabel}
      </button>
    </form>
  );
}
