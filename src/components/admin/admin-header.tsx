'use client';

import { LogOut, Menu } from 'lucide-react';
import { signOut } from 'next-auth/react';

type AdminHeaderProps = Readonly<{
  readonly email: string;
  readonly onOpenNavigation: () => void;
}>;

export function AdminHeader({ email, onOpenNavigation }: AdminHeaderProps): React.JSX.Element {
  return (
    <header className="admin-header">
      <button
        aria-label="打开后台导航"
        className="admin-icon-button admin-header-menu-button"
        onClick={onOpenNavigation}
        type="button"
      >
        <Menu aria-hidden="true" size={18} />
      </button>
      <div>
        <p className="admin-header-kicker">TONG / CMS</p>
        <p className="admin-header-title">内容工作台</p>
      </div>
      <div className="admin-header-account">
        <span>{email}</span>
        <button
          aria-label="退出后台"
          className="admin-icon-button"
          onClick={() => signOut({ callbackUrl: '/admin/login' })}
          type="button"
        >
          <LogOut aria-hidden="true" size={17} />
        </button>
      </div>
    </header>
  );
}
