'use client';

import {
  BrainCircuit,
  BotMessageSquare,
  Blocks,
  Building2,
  CreditCard,
  FolderKanban,
  LogOut,
  ShieldCheck,
  Store,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';

import type { PortalOrganization } from '@/components/saas/types';

type ClientPortalHeaderProps = Readonly<{
  readonly currentPath?: string;
  readonly email: string;
  readonly organization: PortalOrganization;
  readonly organizations: readonly PortalOrganization[];
  readonly organizationSwitchPath?: string;
}>;

export function ClientPortalHeader({
  currentPath = '/client',
  email,
  organization,
  organizations,
  organizationSwitchPath,
}: ClientPortalHeaderProps): React.JSX.Element {
  const router = useRouter();

  function changeOrganization(nextSlug: string): void {
    const searchParameters = new URLSearchParams({ organization: nextSlug });
    router.push(`${organizationSwitchPath ?? currentPath}?${searchParameters.toString()}`);
  }

  return (
    <header className="saas-portal-header">
      <Link className="saas-portal-brand" href={`/client?organization=${organization.slug}`}>
        <span>TONG</span>
        <small>COLLABORATION</small>
      </Link>
      <nav aria-label="客户门户导航" className="saas-portal-navigation">
        <Link
          aria-current={currentPath === '/client' ? 'page' : undefined}
          data-current={currentPath === '/client'}
          href={`/client?organization=${organization.slug}`}
        >
          <FolderKanban aria-hidden="true" size={16} strokeWidth={1.75} />
          <span>项目空间</span>
        </Link>
        <Link
          aria-current={currentPath === '/dashboard/ai' ? 'page' : undefined}
          data-current={currentPath === '/dashboard/ai'}
          href={`/dashboard/ai?organization=${organization.slug}`}
        >
          <BotMessageSquare aria-hidden="true" size={16} strokeWidth={1.75} />
          <span>AI Platform</span>
        </Link>
        <Link
          aria-current={currentPath.startsWith('/dashboard/ai-') ? 'page' : undefined}
          data-current={currentPath.startsWith('/dashboard/ai-')}
          href={`/dashboard/ai-workspace?organization=${organization.slug}`}
        >
          <BrainCircuit aria-hidden="true" size={16} strokeWidth={1.75} />
          <span>AI 操作台</span>
        </Link>
        <Link
          aria-current={currentPath === '/dashboard/apps' ? 'page' : undefined}
          data-current={currentPath === '/dashboard/apps'}
          href={`/dashboard/apps?organization=${organization.slug}`}
        >
          <Blocks aria-hidden="true" size={16} strokeWidth={1.75} />
          <span>AI 应用</span>
        </Link>
        <Link
          aria-current={currentPath === '/dashboard/ecosystem' ? 'page' : undefined}
          data-current={currentPath === '/dashboard/ecosystem'}
          href={`/dashboard/ecosystem?organization=${organization.slug}`}
        >
          <Store aria-hidden="true" size={16} strokeWidth={1.75} />
          <span>生态市场</span>
        </Link>
        <Link
          aria-current={currentPath === '/dashboard/settings/billing' ? 'page' : undefined}
          data-current={currentPath === '/dashboard/settings/billing'}
          href={`/dashboard/settings/billing?organization=${organization.slug}`}
        >
          <CreditCard aria-hidden="true" size={16} strokeWidth={1.75} />
          <span>账单</span>
        </Link>
        <Link
          aria-current={currentPath === '/dashboard/security' ? 'page' : undefined}
          data-current={currentPath === '/dashboard/security'}
          href={`/dashboard/security?organization=${organization.slug}`}
        >
          <ShieldCheck aria-hidden="true" size={16} strokeWidth={1.75} />
          <span>安全</span>
        </Link>
      </nav>
      <div className="saas-portal-account">
        <label className="saas-organization-picker">
          <Building2 aria-hidden="true" size={16} strokeWidth={1.75} />
          <span className="visually-hidden">切换企业空间</span>
          <select
            aria-label="切换企业空间"
            onChange={(event) => changeOrganization(event.target.value)}
            value={organization.slug}
          >
            {organizations.map((item) => (
              <option key={item.id} value={item.slug}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
        <span className="saas-portal-email">{email}</span>
        <button
          aria-label="退出客户门户"
          className="saas-icon-button"
          onClick={() => signOut({ callbackUrl: '/client/login' })}
          type="button"
        >
          <LogOut aria-hidden="true" size={17} />
        </button>
      </div>
    </header>
  );
}
