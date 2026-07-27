import type { AnalyticsAttribution, ContactAnalyticsSource } from '@/types/analytics';

const attributionStorageKey = 'tong.analytics.first-attribution';
const contactSourceStorageKey = 'tong.analytics.contact-source';
const utmValuePattern = /^[\p{L}\p{N}][\p{L}\p{N}._-]*$/u;

export function readUtmAttribution(parameters: URLSearchParams): AnalyticsAttribution {
  const firstSource = sanitizeUtmValue(parameters.get('utm_source'));
  const firstMedium = sanitizeUtmValue(parameters.get('utm_medium'));
  const firstCampaign = sanitizeUtmValue(parameters.get('utm_campaign'));

  return {
    ...(firstSource === undefined ? {} : { firstSource }),
    ...(firstMedium === undefined ? {} : { firstMedium }),
    ...(firstCampaign === undefined ? {} : { firstCampaign }),
  };
}

export function captureFirstUtmAttribution(): AnalyticsAttribution {
  if (typeof window === 'undefined') {
    return {};
  }

  const storedAttribution = readStoredAttribution();

  if (hasAttribution(storedAttribution)) {
    return storedAttribution;
  }

  const attribution = readUtmAttribution(new URLSearchParams(window.location.search));

  if (hasAttribution(attribution)) {
    try {
      window.sessionStorage.setItem(attributionStorageKey, JSON.stringify(attribution));
    } catch {
      return attribution;
    }
  }

  return attribution;
}

export function readFirstUtmAttribution(): AnalyticsAttribution {
  return typeof window === 'undefined' ? {} : readStoredAttribution();
}

export function rememberContactSource(source: ContactAnalyticsSource): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.sessionStorage.setItem(contactSourceStorageKey, source);
  } catch {
    // Session storage is optional and analytics must never interrupt navigation.
  }
}

export function readContactSource(): ContactAnalyticsSource | undefined {
  if (typeof window === 'undefined') {
    return undefined;
  }

  try {
    const value = window.sessionStorage.getItem(contactSourceStorageKey);

    return isContactSource(value) ? value : undefined;
  } catch {
    return undefined;
  }
}

function readStoredAttribution(): AnalyticsAttribution {
  try {
    const storedValue = window.sessionStorage.getItem(attributionStorageKey);

    if (storedValue === null) {
      return {};
    }

    const parsed: unknown = JSON.parse(storedValue);

    if (!isRecord(parsed)) {
      return {};
    }

    const firstSource = sanitizeUtmValue(parsed['firstSource']);
    const firstMedium = sanitizeUtmValue(parsed['firstMedium']);
    const firstCampaign = sanitizeUtmValue(parsed['firstCampaign']);

    return {
      ...(firstSource === undefined ? {} : { firstSource }),
      ...(firstMedium === undefined ? {} : { firstMedium }),
      ...(firstCampaign === undefined ? {} : { firstCampaign }),
    };
  } catch {
    return {};
  }
}

function hasAttribution(attribution: AnalyticsAttribution): boolean {
  return (
    attribution.firstSource !== undefined ||
    attribution.firstMedium !== undefined ||
    attribution.firstCampaign !== undefined
  );
}

function sanitizeUtmValue(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }

  const normalizedValue = value.trim();

  return normalizedValue.length > 0 &&
    normalizedValue.length <= 80 &&
    utmValuePattern.test(normalizedValue)
    ? normalizedValue
    : undefined;
}

function isRecord(value: unknown): value is Readonly<Record<string, unknown>> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isContactSource(value: string | null): value is ContactAnalyticsSource {
  return (
    value === 'hero' ||
    value === 'services' ||
    value === 'footer' ||
    value === 'ai' ||
    value === 'projects' ||
    value === 'navigation' ||
    value === 'contact_cta' ||
    value === 'direct'
  );
}
