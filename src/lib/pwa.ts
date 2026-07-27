export const PWA_CACHE_VERSION = 'tong-v1' as const;
export const PWA_CACHE_PREFIX = 'tong-' as const;
export const PWA_OFFLINE_PATH = '/offline' as const;

export const PWA_CACHE_NAMES = {
  static: `${PWA_CACHE_VERSION}-static`,
  images: `${PWA_CACHE_VERSION}-images`,
  pages: `${PWA_CACHE_VERSION}-pages`,
} as const;

export const pwaRuntimeCacheKinds = ['static', 'images', 'pages'] as const;

export type PwaRuntimeCacheKind = (typeof pwaRuntimeCacheKinds)[number];

export type PwaRuntimeRequest = Readonly<{
  readonly destination: string;
  readonly method: string;
  readonly mode: string;
  readonly pathname: string;
  readonly rsc: boolean;
}>;

const PWA_PUBLIC_ROUTE_PREFIXES = ['/about', '/projects', '/blog'] as const;
const PWA_LOCALE_PREFIXES = ['en', 'en-US', 'zh', 'zh-CN'] as const;
const PWA_SENSITIVE_ROUTE_PREFIXES = ['/admin', '/api'] as const;
const PWA_STATIC_DESTINATIONS = ['font', 'script', 'style'] as const;

function normalizeLeadingSlash(pathname: string): string {
  return pathname.startsWith('/') ? pathname : `/${pathname}`;
}

function hasLocalePrefix(pathnameSegment: string | undefined): boolean {
  return PWA_LOCALE_PREFIXES.some((locale) => locale === pathnameSegment);
}

function matchesPathPrefix(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

export function normalizePwaNavigationPath(pathname: string): string {
  const normalizedPathname = normalizeLeadingSlash(pathname).replace(/\/+$/, '') || '/';
  const segments = normalizedPathname.split('/').filter(Boolean);

  if (hasLocalePrefix(segments[0])) {
    const localizedPathname = `/${segments.slice(1).join('/')}`;

    return localizedPathname === '/' ? '/' : localizedPathname;
  }

  return normalizedPathname;
}

export function isPwaSensitivePath(pathname: string): boolean {
  const normalizedPathname = normalizePwaNavigationPath(pathname);

  return PWA_SENSITIVE_ROUTE_PREFIXES.some((prefix) =>
    matchesPathPrefix(normalizedPathname, prefix),
  );
}

export function isPwaPublicNavigationPath(pathname: string): boolean {
  const normalizedPathname = normalizePwaNavigationPath(pathname);

  if (normalizedPathname === '/' || isPwaSensitivePath(normalizedPathname)) {
    return normalizedPathname === '/';
  }

  return PWA_PUBLIC_ROUTE_PREFIXES.some((prefix) => matchesPathPrefix(normalizedPathname, prefix));
}

export function getPwaRuntimeCacheKind(
  request: PwaRuntimeRequest,
): PwaRuntimeCacheKind | undefined {
  if (request.method !== 'GET' || isPwaSensitivePath(request.pathname)) {
    return undefined;
  }

  if (request.destination === 'image') {
    return 'images';
  }

  if (
    PWA_STATIC_DESTINATIONS.some((destination) => destination === request.destination) ||
    request.pathname.startsWith('/_next/static/') ||
    request.pathname.startsWith('/icons/')
  ) {
    return 'static';
  }

  if ((request.mode === 'navigate' || request.rsc) && isPwaPublicNavigationPath(request.pathname)) {
    return 'pages';
  }

  return undefined;
}

export function isManagedPwaCacheName(cacheName: string): boolean {
  return cacheName.startsWith(PWA_CACHE_PREFIX);
}
