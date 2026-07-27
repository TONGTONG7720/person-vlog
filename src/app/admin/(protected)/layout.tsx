import type { ReactNode } from 'react';

import { AdminShell } from '@/components/admin/admin-shell';
import { requireAdminSession } from '@/server/cms/auth';

type ProtectedAdminLayoutProps = Readonly<{
  readonly children: ReactNode;
}>;

export default async function ProtectedAdminLayout({
  children,
}: ProtectedAdminLayoutProps): Promise<React.JSX.Element> {
  const session = await requireAdminSession();

  return <AdminShell email={session.email}>{children}</AdminShell>;
}
