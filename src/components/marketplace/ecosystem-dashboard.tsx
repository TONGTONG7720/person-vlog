'use client';

import { ArrowUpRight, BarChart3, Send } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { MarketplacePublishForm } from '@/components/marketplace/marketplace-publish-form';

type EcosystemItem = Readonly<{
  readonly createdAt: string;
  readonly favoriteCount: number;
  readonly id: string;
  readonly slug: string;
  readonly status: string;
  readonly title: string;
  readonly type: string;
  readonly updatedAt: string;
  readonly usageCount: number;
}>;

type EcosystemDashboardProps = Readonly<{
  readonly canPublish: boolean;
  readonly items: readonly EcosystemItem[];
  readonly metrics: Readonly<{
    readonly favorites: number;
    readonly published: number;
    readonly revenueCents: number;
    readonly submissions: number;
    readonly usage: number;
  }>;
  readonly organizationSlug: string;
}>;

export function EcosystemDashboard({
  canPublish,
  items,
  metrics,
  organizationSlug,
}: EcosystemDashboardProps): React.JSX.Element {
  const router = useRouter();
  const [submittingId, setSubmittingId] = useState<string>();
  const [feedback, setFeedback] = useState<string>();

  async function submitForReview(itemId: string): Promise<void> {
    setSubmittingId(itemId);
    setFeedback(undefined);

    try {
      const response = await fetch(
        `/api/v1/marketplace/items/${encodeURIComponent(itemId)}/submit?organization=${encodeURIComponent(organizationSlug)}`,
        { method: 'POST', signal: AbortSignal.timeout(15_000) },
      );

      if (!response.ok) {
        setFeedback(await getFailureMessage(response));

        return;
      }

      router.refresh();
    } catch (error) {
      if (error instanceof DOMException || error instanceof TypeError) {
        setFeedback('提交审核失败，请稍后重试。');

        return;
      }

      throw error;
    } finally {
      setSubmittingId(undefined);
    }
  }

  return (
    <div className="marketplace-dashboard-stack">
      <section aria-label="生态市场数据" className="marketplace-metric-grid">
        <MarketplaceMetric label="发布" value={metrics.submissions} />
        <MarketplaceMetric label="已发布" value={metrics.published} />
        <MarketplaceMetric label="调用" value={metrics.usage} />
        <MarketplaceMetric label="收藏" value={metrics.favorites} />
        <MarketplaceMetric
          label="收益预留"
          value={`¥${(metrics.revenueCents / 100).toLocaleString('zh-CN')}`}
        />
      </section>
      {canPublish ? <MarketplacePublishForm organizationSlug={organizationSlug} /> : null}
      <section
        aria-labelledby="marketplace-dashboard-items-heading"
        className="marketplace-dashboard-items"
      >
        <div className="marketplace-panel-heading">
          <div>
            <p className="marketplace-kicker">YOUR RELEASES</p>
            <h2 id="marketplace-dashboard-items-heading">你的发布与审核状态。</h2>
          </div>
          <BarChart3 aria-hidden="true" size={22} strokeWidth={1.5} />
        </div>
        {feedback === undefined ? null : (
          <p className="marketplace-inline-feedback" role="alert">
            {feedback}
          </p>
        )}
        {items.length === 0 ? (
          <div className="marketplace-empty-state">
            <p>还没有创建发布草稿。</p>
            <span>先建立一个 Agent、Prompt、Template 或 Plugin 草稿，再送交人工审核。</span>
          </div>
        ) : (
          <ul className="marketplace-dashboard-list">
            {items.map((item) => (
              <li key={item.id}>
                <div>
                  <span>{item.type}</span>
                  <strong>{item.title}</strong>
                  <small>
                    {item.slug} ·{' '}
                    {new Intl.DateTimeFormat('zh-CN', { dateStyle: 'medium' }).format(
                      new Date(item.updatedAt),
                    )}
                  </small>
                </div>
                <div className="marketplace-dashboard-item-meta">
                  <span data-status={item.status}>{item.status}</span>
                  <small>
                    {item.usageCount} 调用 · {item.favoriteCount} 收藏
                  </small>
                </div>
                {item.status === 'DRAFT' || item.status === 'REJECTED' ? (
                  <button
                    disabled={submittingId === item.id}
                    onClick={() => void submitForReview(item.id)}
                    type="button"
                  >
                    <Send aria-hidden="true" size={15} strokeWidth={1.75} />
                    <span>{submittingId === item.id ? '提交中…' : '提交审核'}</span>
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>
      <div className="marketplace-dashboard-links">
        <Link href="/marketplace">
          <span>浏览公开 Marketplace</span>
          <ArrowUpRight aria-hidden="true" size={16} strokeWidth={1.75} />
        </Link>
        <Link href="/developers/docs">
          <span>查看 API 文档</span>
          <ArrowUpRight aria-hidden="true" size={16} strokeWidth={1.75} />
        </Link>
      </div>
    </div>
  );
}

function MarketplaceMetric({
  label,
  value,
}: Readonly<{ readonly label: string; readonly value: number | string }>) {
  return (
    <div>
      <span>{label}</span>
      <strong>{typeof value === 'number' ? value.toLocaleString('zh-CN') : value}</strong>
    </div>
  );
}

async function getFailureMessage(response: Response): Promise<string> {
  try {
    const payload: unknown = await response.json();

    return typeof payload === 'object' &&
      payload !== null &&
      'message' in payload &&
      typeof payload.message === 'string'
      ? payload.message
      : '提交审核失败。';
  } catch (error) {
    if (error instanceof SyntaxError) {
      return '提交审核服务返回了无法识别的响应。';
    }

    throw error;
  }
}
