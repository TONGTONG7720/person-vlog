import { compare } from 'bcryptjs';
import type { NextAuthOptions } from 'next-auth';
import { getServerSession } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { redirect } from 'next/navigation';

import { getCmsDatabase, isCmsDatabaseConfigured } from '@/server/cms/database';
import { adminLoginSchema } from '@/server/cms/validation';

const configuredAdminEmail = process.env['ADMIN_EMAIL']?.trim().toLocaleLowerCase('en-US');
const configuredAuthSecret = process.env['AUTH_SECRET']?.trim();

function isConfiguredAdministrator(email: string): boolean {
  return (
    configuredAdminEmail !== undefined &&
    configuredAdminEmail !== '' &&
    email === configuredAdminEmail
  );
}

export function isCmsAuthenticationConfigured(): boolean {
  return (
    isSaasAuthenticationConfigured() &&
    configuredAdminEmail !== undefined &&
    configuredAdminEmail !== ''
  );
}

export function isSaasAuthenticationConfigured(): boolean {
  return (
    isCmsDatabaseConfigured() && configuredAuthSecret !== undefined && configuredAuthSecret !== ''
  );
}

export const adminAuthOptions = {
  pages: {
    signIn: '/admin/login',
  },
  providers: [
    CredentialsProvider({
      id: 'admin-credentials',
      name: 'Administrator credentials',
      credentials: {
        email: { label: '邮箱', type: 'email' },
        password: { label: '密码', type: 'password' },
      },
      async authorize(credentials) {
        const parsedCredentials = adminLoginSchema.safeParse(credentials);

        if (!parsedCredentials.success) {
          return null;
        }

        const email = parsedCredentials.data.email.toLocaleLowerCase('en-US');
        const database = getCmsDatabase();

        if (
          !isCmsAuthenticationConfigured() ||
          !isConfiguredAdministrator(email) ||
          database === undefined
        ) {
          return null;
        }

        const user = await database.user.findUnique({ where: { email } });

        if (user?.passwordHash === undefined || user.passwordHash === null) {
          return null;
        }

        const passwordMatches = await compare(parsedCredentials.data.password, user.passwordHash);

        return passwordMatches ? { email: user.email, id: user.id, name: '管理员' } : null;
      },
    }),
    CredentialsProvider({
      id: 'client-credentials',
      name: 'Client credentials',
      credentials: {
        email: { label: '邮箱', type: 'email' },
        password: { label: '密码', type: 'password' },
      },
      async authorize(credentials) {
        const parsedCredentials = adminLoginSchema.safeParse(credentials);

        if (!parsedCredentials.success || !isSaasAuthenticationConfigured()) {
          return null;
        }

        const email = parsedCredentials.data.email.toLocaleLowerCase('en-US');
        const database = getCmsDatabase();

        if (database === undefined) {
          return null;
        }

        const user = await database.user.findUnique({ where: { email } });

        if (user?.passwordHash === undefined || user.passwordHash === null) {
          return null;
        }

        const passwordMatches = await compare(parsedCredentials.data.password, user.passwordHash);

        return passwordMatches ? { email: user.email, id: user.id, name: user.email } : null;
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  ...(configuredAuthSecret === undefined || configuredAuthSecret === ''
    ? {}
    : { secret: configuredAuthSecret }),
} satisfies NextAuthOptions;

export type AdminSession = Readonly<{
  readonly email: string;
}>;

export async function getAdminSession(): Promise<AdminSession | undefined> {
  if (!isCmsAuthenticationConfigured()) {
    return undefined;
  }

  const session = await getServerSession(adminAuthOptions);
  const email = session?.user?.email?.toLocaleLowerCase('en-US');

  return email !== undefined && isConfiguredAdministrator(email) ? { email } : undefined;
}

export async function requireAdminSession(): Promise<AdminSession> {
  const session = await getAdminSession();

  if (session === undefined) {
    redirect('/admin/login');
  }

  return session;
}
