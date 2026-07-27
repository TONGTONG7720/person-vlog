import {
  AdminFormFeedback,
  AdminPageHeader,
  AdminSearchForm,
  AdminSetupNotice,
} from '@/components/admin/admin-page-primitives';
import { MarketplaceReviewQueue } from '@/components/marketplace/marketplace-review-queue';
import { getAdminMarketplaceOverview } from '@/server/marketplace/admin';

export const dynamic = 'force-dynamic';

type AdminMarketplacePageProps = Readonly<{
  readonly searchParams: Promise<
    Readonly<{
      readonly error?: string | string[];
      readonly page?: string | string[];
      readonly search?: string | string[];
      readonly success?: string | string[];
    }>
  >;
}>;

export default async function AdminMarketplacePage({
  searchParams,
}: AdminMarketplacePageProps): Promise<React.JSX.Element> {
  const query = await searchParams;
  const search = typeof query.search === 'string' ? query.search : '';
  const parsedPage = typeof query.page === 'string' ? Number(query.page) : 1;
  const overview = await getAdminMarketplaceOverview({
    page: Number.isFinite(parsedPage) ? parsedPage : 1,
    ...(search === '' ? {} : { search }),
  });

  return (
    <main className="admin-page admin-marketplace-page">
      <AdminPageHeader
        description="AI 仅提供基础安全辅助；所有 Marketplace 发布、拒绝与下架均需要管理员人工确认。"
        eyebrow="ECOSYSTEM / MODERATION"
        title="Marketplace 审核"
      />
      <AdminFormFeedback error={query.error} success={query.success} />
      {overview === undefined ? (
        <AdminSetupNotice />
      ) : (
        <>
          <div className="admin-marketplace-toolbar">
            <AdminSearchForm action="/admin/marketplace" search={search} />
            <p>
              待审核：<strong>{overview.pendingCount}</strong>
            </p>
          </div>
          <MarketplaceReviewQueue items={overview.items} />
        </>
      )}
    </main>
  );
}
