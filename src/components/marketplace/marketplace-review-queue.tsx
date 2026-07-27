import { CheckCircle2, Clock3, ShieldAlert, XCircle } from 'lucide-react';

import { moderateAdminMarketplaceItem } from '@/actions/admin/marketplace';

type MarketplaceReviewItem = Readonly<{
  readonly category: string;
  readonly createdAt: Date;
  readonly creatorName: string;
  readonly id: string;
  readonly reviewReason: string | null;
  readonly slug: string;
  readonly status: string;
  readonly title: string;
  readonly type: string;
}>;

export function MarketplaceReviewQueue({
  items,
}: Readonly<{ readonly items: readonly MarketplaceReviewItem[] }>): React.JSX.Element {
  if (items.length === 0) {
    return (
      <div className="marketplace-empty-state">
        <p>当前没有待管理的 Marketplace 发布。</p>
        <span>新的草稿提交审核后，会在这里显示。</span>
      </div>
    );
  }

  return (
    <div className="marketplace-review-queue">
      {items.map((item) => (
        <article key={item.id}>
          <header>
            <div>
              <p>
                {item.type} · {item.category}
              </p>
              <h2>{item.title}</h2>
              <span>
                {item.creatorName} · {item.slug}
              </span>
            </div>
            <span data-status={item.status}>
              <Clock3 aria-hidden="true" size={14} strokeWidth={1.75} />
              {item.status}
            </span>
          </header>
          {item.reviewReason === null ? null : (
            <p className="marketplace-review-reason">上次说明：{item.reviewReason}</p>
          )}
          {item.status === 'REVIEW' ? (
            <form action={moderateAdminMarketplaceItem} className="marketplace-review-form">
              <input name="id" type="hidden" value={item.id} />
              <label>
                <span>审核说明（拒绝时建议填写）</span>
                <input maxLength={1000} name="reason" />
              </label>
              <div>
                <button name="status" type="submit" value="PUBLISHED">
                  <CheckCircle2 aria-hidden="true" size={15} strokeWidth={1.75} />
                  发布
                </button>
                <button name="status" type="submit" value="REJECTED">
                  <ShieldAlert aria-hidden="true" size={15} strokeWidth={1.75} />
                  拒绝
                </button>
                <button name="status" type="submit" value="ARCHIVED">
                  <XCircle aria-hidden="true" size={15} strokeWidth={1.75} />
                  下架
                </button>
              </div>
            </form>
          ) : item.status === 'PUBLISHED' ? (
            <form action={moderateAdminMarketplaceItem} className="marketplace-review-form">
              <input name="id" type="hidden" value={item.id} />
              <button name="status" type="submit" value="ARCHIVED">
                <XCircle aria-hidden="true" size={15} strokeWidth={1.75} />
                下架此条目
              </button>
            </form>
          ) : null}
        </article>
      ))}
    </div>
  );
}
