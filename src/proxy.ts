import { withAuth, type NextRequestWithAuth } from 'next-auth/middleware';
import createIntlMiddleware from 'next-intl/middleware';
import { NextResponse, type NextFetchEvent, type NextRequest } from 'next/server';

import { routing } from '@/i18n/config';
import { isPlatformPublicRoute } from '@/i18n/platform-public-routes';

const configuredAuthSecret = process.env['AUTH_SECRET']?.trim();
const configuredAdminEmail = process.env['ADMIN_EMAIL']?.trim().toLocaleLowerCase('en-US');
const isAuthenticationConfigured =
  configuredAuthSecret !== undefined &&
  configuredAuthSecret !== '' &&
  configuredAdminEmail !== undefined &&
  configuredAdminEmail !== '';

const handleAdminAuthentication = withAuth({
  callbacks: {
    authorized: ({ token }) =>
      isAuthenticationConfigured &&
      token?.email?.toLocaleLowerCase('en-US') === configuredAdminEmail,
  },
  pages: {
    signIn: '/admin/login',
  },
  ...(configuredAuthSecret === undefined || configuredAuthSecret === ''
    ? {}
    : { secret: configuredAuthSecret }),
});

const handleInternationalizedPublicRoute = createIntlMiddleware(routing);

export function proxy(request: NextRequest, event: NextFetchEvent) {
  if (
    request.nextUrl.pathname === '/offline' ||
    request.nextUrl.pathname.startsWith('/client') ||
    request.nextUrl.pathname.startsWith('/dashboard') ||
    request.nextUrl.pathname.startsWith('/signup') ||
    isPlatformPublicRoute(request.nextUrl.pathname)
  ) {
    return NextResponse.next();
  }

  return request.nextUrl.pathname.startsWith('/admin')
    ? handleAdminAuthentication(request as NextRequestWithAuth, event)
    : handleInternationalizedPublicRoute(request);
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*|zh-CN(?:/|$)|en-US(?:/|$)).*)'],
};
