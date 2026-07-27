export type Locale = 'zh-CN' | 'en-US';

export type LocalizedValue<Value> = Readonly<{
  readonly 'en-US': Value;
  readonly 'zh-CN': Value;
}>;

export type ContentLocaleStatus = 'both' | Locale;
