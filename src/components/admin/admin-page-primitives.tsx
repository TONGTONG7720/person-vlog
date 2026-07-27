import Link from 'next/link';
import type { ReactNode } from 'react';

type AdminPageHeaderProps = Readonly<{
  readonly actions?: ReactNode;
  readonly description: string;
  readonly eyebrow: string;
  readonly title: string;
}>;

type AdminFeedbackProps = Readonly<{
  readonly error?: string | string[] | undefined;
  readonly success?: string | string[] | undefined;
}>;

type AdminSearchFormProps = Readonly<{
  readonly action: string;
  readonly search: string;
}>;

type AdminPaginationProps = Readonly<{
  readonly itemCount: number;
  readonly page: number;
  readonly pathname: string;
  readonly search: string;
}>;

export function AdminPageHeader({
  actions,
  description,
  eyebrow,
  title,
}: AdminPageHeaderProps): React.JSX.Element {
  return (
    <header className="admin-page-header">
      <div className="admin-page-header-copy">
        <p className="admin-kicker">{eyebrow}</p>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {actions}
    </header>
  );
}

export function AdminSetupNotice(): React.JSX.Element {
  return (
    <p className="admin-setup-notice" role="status">
      CMS 数据库尚未连接。请配置 DATABASE_URL、AUTH_SECRET 和管理员账号环境变量，再执行迁移与
      初始化命令后开始管理内容。
    </p>
  );
}

export function AdminFormFeedback({
  error,
  success,
}: AdminFeedbackProps): React.JSX.Element | null {
  if (isActiveQueryFlag(success)) {
    return (
      <p className="admin-form-feedback admin-feedback-success" role="status">
        保存成功，后台列表已刷新。
      </p>
    );
  }

  if (isActiveQueryFlag(error)) {
    return (
      <p className="admin-form-feedback" role="alert">
        无法保存本次更改。请检查字段格式、登录状态和数据库连接后重试。
      </p>
    );
  }

  return null;
}

export function AdminSearchForm({ action, search }: AdminSearchFormProps): React.JSX.Element {
  return (
    <form action={action} className="admin-search-form" method="get" role="search">
      <label className="visually-hidden" htmlFor="admin-search">
        搜索当前内容
      </label>
      <input
        defaultValue={search}
        id="admin-search"
        name="search"
        placeholder="搜索标题、Slug 或联系人"
      />
      <button className="admin-secondary-button" type="submit">
        搜索
      </button>
    </form>
  );
}

export function AdminPagination({
  itemCount,
  page,
  pathname,
  search,
}: AdminPaginationProps): React.JSX.Element | null {
  if (itemCount === 0 && page === 1) {
    return null;
  }

  const previousHref = createPaginationHref(pathname, Math.max(1, page - 1), search);
  const nextHref = createPaginationHref(pathname, page + 1, search);

  return (
    <nav aria-label="内容分页" className="admin-pagination">
      {page > 1 ? <Link href={previousHref}>上一页</Link> : <span>上一页</span>}
      <span>第 {page} 页</span>
      {itemCount < 12 ? <span>下一页</span> : <Link href={nextHref}>下一页</Link>}
    </nav>
  );
}

export function AdminEmptyState({
  children,
}: Readonly<{ readonly children: ReactNode }>): React.JSX.Element {
  return <p className="admin-empty-state">{children}</p>;
}

export function formatAdminDate(value: Date): string {
  return new Intl.DateTimeFormat('zh-CN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(value);
}

function createPaginationHref(pathname: string, page: number, search: string): string {
  const query = new URLSearchParams({ page: String(page) });

  if (search !== '') {
    query.set('search', search);
  }

  return `${pathname}?${query.toString()}`;
}

function isActiveQueryFlag(value: string | string[] | undefined): boolean {
  return value === '1' || (Array.isArray(value) && value.includes('1'));
}
