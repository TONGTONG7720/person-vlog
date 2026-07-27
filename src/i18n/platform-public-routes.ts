const platformPublicRoutePrefixes = [
  '/marketplace',
  '/app-marketplace',
  '/app',
  '/developer',
  '/developers',
] as const;

export function isPlatformPublicRoute(pathname: string): boolean {
  return platformPublicRoutePrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}
