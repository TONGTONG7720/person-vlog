import { ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { createMetadata } from '@/lib/metadata';
import { getPublicMarketplaceItemBySlug } from '@/server/marketplace/public-catalog';

export const dynamic = 'force-dynamic';

type MarketplaceItemPageProps = Readonly<{
  readonly params: Promise<Readonly<{ readonly slug: string }>>;
}>;

export async function generateMetadata({ params }: MarketplaceItemPageProps) {
  const { slug } = await params;
  const item = await getPublicMarketplaceItemBySlug(slug);

  return item === undefined
    ? createMetadata({ path: '/marketplace', title: 'Marketplace 条目 | 瞳瞳' })
    : createMetadata({
        description: item.description,
        path: `/marketplace/${item.slug}`,
        title: `${item.title} | AI Builder Marketplace`,
      });
}

export default async function MarketplaceItemPage({
  params,
}: MarketplaceItemPageProps): Promise<React.JSX.Element> {
  const { slug } = await params;
  const item = await getPublicMarketplaceItemBySlug(slug);

  if (item === undefined) {
    notFound();
  }

  const price =
    item.priceCents === null ? '免费使用' : `¥${(item.priceCents / 100).toLocaleString('zh-CN')}`;

  return (
    <main className="marketplace-detail-page">
      <Link className="marketplace-back-link" href="/marketplace">
        <ArrowLeft aria-hidden="true" size={16} strokeWidth={1.75} />
        <span>返回 Marketplace</span>
      </Link>
      <article className="marketplace-detail-card">
        <header>
          <p>
            {item.type} · {item.category}
          </p>
          <h1>{item.title}</h1>
          <p>{item.description}</p>
        </header>
        <dl>
          <div>
            <dt>创作者</dt>
            <dd>
              {item.creator.displayName}
              {item.creator.verified ? ' · 已验证' : ''}
            </dd>
          </div>
          <div>
            <dt>价格</dt>
            <dd>{price}</dd>
          </div>
          <div>
            <dt>使用</dt>
            <dd>{item.usageCount.toLocaleString('zh-CN')} 次调用</dd>
          </div>
          <div>
            <dt>评价</dt>
            <dd>
              {item.rating === null
                ? '暂无公开评价'
                : `${item.rating.toFixed(1)} / 5（${item.ratingCount}）`}
            </dd>
          </div>
        </dl>
        <ul className="marketplace-tag-list" aria-label="条目标签">
          {item.tags.map((tag) => (
            <li key={tag}>{tag}</li>
          ))}
        </ul>
        <aside>
          <ShieldCheck aria-hidden="true" size={19} strokeWidth={1.75} />
          <p>这是已审核的公开元数据。系统提示词、私有知识库和第三方插件凭据不会在市场页暴露。</p>
        </aside>
        <Link href="/developers/docs">
          <span>用 Developer API 调用已发布 Agent</span>
          <ArrowRight aria-hidden="true" size={16} strokeWidth={1.75} />
        </Link>
      </article>
    </main>
  );
}
