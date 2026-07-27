import type { ReactNode } from 'react';

import { requireSaasContext } from '@/server/saas/auth';

type ClientPortalLayoutProps = Readonly<{
  readonly children: ReactNode;
}>;

export default async function ClientPortalLayout({
  children,
}: ClientPortalLayoutProps): Promise<React.JSX.Element> {
  await requireSaasContext();

  return (
    <div className="saas-portal-shell">
      <main className="saas-client-main">{children}</main>
    </div>
  );
}
