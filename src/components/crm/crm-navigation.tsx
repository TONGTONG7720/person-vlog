import Link from 'next/link';

const crmNavigationItems = [
  { href: '/admin/crm/dashboard', label: '概览' },
  { href: '/admin/crm/leads', label: '线索' },
  { href: '/admin/crm/projects', label: '客户项目' },
  { href: '/admin/crm/tasks', label: '任务' },
  { href: '/admin/crm/settings', label: '自动化' },
] as const;

type CrmNavigationProps = Readonly<{
  readonly current: (typeof crmNavigationItems)[number]['href'];
}>;

export function CrmNavigation({ current }: CrmNavigationProps): React.JSX.Element {
  return (
    <nav aria-label="CRM 功能导航" className="crm-navigation">
      {crmNavigationItems.map((item) => (
        <Link
          aria-current={current === item.href ? 'page' : undefined}
          href={item.href}
          key={item.href}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
