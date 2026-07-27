export const enterpriseSsoProviders = ['SAML', 'OIDC', 'OAUTH2'] as const;

export type EnterpriseSsoProvider = (typeof enterpriseSsoProviders)[number];

export type EnterpriseSsoReadinessInput = Readonly<{
  readonly authorizationUrl?: string;
  readonly domainVerified: boolean;
  readonly enabled: boolean;
  readonly metadataUrl?: string;
  readonly provider: EnterpriseSsoProvider;
}>;

export function normalizeEnterpriseDomain(value: string): string | undefined {
  const domain = value.trim().toLocaleLowerCase('en-US').replace(/\.$/u, '');

  if (
    domain === '' ||
    domain.length > 253 ||
    domain.includes('://') ||
    domain.includes('/') ||
    domain.includes('@') ||
    !/^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/u.test(domain)
  ) {
    return undefined;
  }

  return domain;
}

export function createDomainVerificationToken(randomValue: () => string): string {
  return `tong-enterprise=${randomValue()}`;
}

export function isSsoConnectionReady(input: EnterpriseSsoReadinessInput): boolean {
  if (!input.enabled || !input.domainVerified) {
    return false;
  }

  switch (input.provider) {
    case 'OIDC':
    case 'OAUTH2':
      return isHttpsUrl(input.authorizationUrl);
    case 'SAML':
      return isHttpsUrl(input.metadataUrl);
  }
}

function isHttpsUrl(value: string | undefined): boolean {
  if (value === undefined) {
    return false;
  }

  try {
    return new URL(value).protocol === 'https:';
  } catch (error) {
    if (error instanceof TypeError) {
      return false;
    }

    throw error;
  }
}
