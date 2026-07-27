import type { Locale } from '@/types/i18n';

export type LocalizedOverrides<Value extends object> = Readonly<
  Partial<Record<Locale, Readonly<Partial<Value>>>>
>;

/**
 * Keeps the canonical record (currently Chinese) in one place and overlays only
 * language-specific copy at read time. Shared identifiers, media and technical
 * fields stay single-sourced.
 */
export function getLocalizedRecord<Value extends object>(
  source: Value,
  locale: Locale,
  overrides: LocalizedOverrides<Value> | undefined,
): Value {
  const localizedCopy = overrides?.[locale];

  return localizedCopy === undefined ? source : { ...source, ...localizedCopy };
}
