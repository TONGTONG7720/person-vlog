'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { adminNavigationItems } from '@/components/admin/admin-navigation';

type AdminSidebarProps = Readonly<{
  readonly onNavigate?: () => void;
}>;

export function AdminSidebar({ onNavigate }: AdminSidebarProps): React.JSX.Element {
  const pathname = usePathname();

  return (
    <nav aria-label="后台导航" className="admin-sidebar-navigation">
      <p className="admin-sidebar-label">CONTENT SYSTEM</p>
      <ul>
        {adminNavigationItems.map((item) => {
          const isCurrent =
            pathname === item.href ||
            (item.href === '/admin/crm/dashboard' && pathname.startsWith('/admin/crm')) ||
            (item.href === '/admin/ai' && pathname.startsWith('/admin/ai/')) ||
            (item.href === '/admin/ai-platform' && pathname.startsWith('/admin/ai-platform'));
          const Icon = item.icon;

          return (
            <li key={item.href}>
              <Link
                aria-current={isCurrent ? 'page' : undefined}
                className="admin-sidebar-link"
                data-current={isCurrent}
                href={item.href}
                {...(onNavigate === undefined ? {} : { onClick: onNavigate })}
              >
                <Icon aria-hidden="true" size={16} strokeWidth={1.75} />
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
