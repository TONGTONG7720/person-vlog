'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { useState } from 'react';
import type { PropsWithChildren } from 'react';

import { AdminHeader } from '@/components/admin/admin-header';
import { AdminSidebar } from '@/components/admin/admin-sidebar';

type AdminShellProps = Readonly<
  PropsWithChildren<{
    readonly email: string;
  }>
>;

export function AdminShell({ children, email }: AdminShellProps): React.JSX.Element {
  const [isMobileNavigationOpen, setIsMobileNavigationOpen] = useState(false);

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <span>TONG</span>
          <small>ADMIN</small>
        </div>
        <AdminSidebar />
      </aside>
      <div className="admin-workspace">
        <AdminHeader email={email} onOpenNavigation={() => setIsMobileNavigationOpen(true)} />
        <div className="admin-page-content">{children}</div>
      </div>
      <Dialog.Root onOpenChange={setIsMobileNavigationOpen} open={isMobileNavigationOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="admin-mobile-navigation-overlay" />
          <Dialog.Content className="admin-mobile-navigation-drawer">
            <div className="admin-mobile-navigation-topline">
              <Dialog.Title>TONG / CMS</Dialog.Title>
              <Dialog.Close aria-label="关闭后台导航" className="admin-icon-button">
                <X aria-hidden="true" size={18} />
              </Dialog.Close>
            </div>
            <AdminSidebar onNavigate={() => setIsMobileNavigationOpen(false)} />
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
