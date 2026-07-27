'use client';

import Fuse from 'fuse.js';
import { ArrowUpRight, Search, Star } from 'lucide-react';
import Link from 'next/link';
import { useDeferredValue, useMemo, useState } from 'react';

export type MarketplaceExplorerItem = Readonly<{
  readonly category: string;
  readonly creator: Readonly<{ readonly displayName: string; readonly verified: boolean }>;
  readonly description: string;
  readonly favoriteCount: number;
  readonly id: string;
  readonly priceCents: number | null;
  readonly rating: number | null;
  readonly ratingCount: number;
  readonly slug: string;
  readonly tags: readonly string[];
  readonly title: string;
  readonly type: 'AGENT' | 'WORKFLOW' | 'PROMPT' | 'TEMPLATE' | 'PLUGIN';
  readonly usageCount: number;
}>;

type MarketplaceExplorerProps = Readonly<{
  readonly items: readonly MarketplaceExplorerItem[];
  readonly search?: string;
}>;

const marketplaceItemTypes = ['ALL', 'AGENT', 'WORKFLOW', 'PROMPT', 'TEMPLATE', 'PLUGIN'] as const;

export function MarketplaceExplorer({
  items,
  search = '',
}: MarketplaceExplorerProps): React.JSX.Element {
  const [query, setQuery] = useState(search);
  const [type, setType] = useState<(typeof marketplaceItemTypes)[number]>('ALL');
  const deferredQuery = useDeferredValue(query.trim());
  const fuse = useMemo(
    () =>
      new Fuse(items, {
        ignoreLocation: true,
        keys: ['title', 'description', 'tags', 'creator.displayName', 'category'],
        threshold: 0.34,
      }),
    [items],
  );
  const searchedItems =
    deferredQuery === '' ? items : fuse.search(deferredQuery).map((result) => result.item);
  const visibleItems =
    type === 'ALL' ? searchedItems : searchedItems.filter((item) => item.type === type);

  return (
    <section aria-label="Marketplace 条目" className="marketplace-explorer">
      <div className="marketplace-explorer-controls">
        <label className="marketplace-search-control">
          <Search aria-hidden="true" size={18} strokeWidth={1.75} />
          <span className="visually-hidden">搜索当前页 Marketplace 条目</span>
          <input
            onChange={(event) => setQuery(event.target.value)}
            placeholder="搜索名称、标签、类型或创作者"
            type="search"
            value={query}
          />
        </label>
        <label className="marketplace-type-control">
          <span>类型</span>
          <select
            onChange={(event) =>
              setType(event.target.value as (typeof marketplaceItemTypes)[number])
            }
            value={type}
          >
            {marketplaceItemTypes.map((itemType) => (
              <option key={itemType} value={itemType}>
                {itemType === 'ALL' ? '全部类型' : itemType}
              </option>
            ))}
          </select>
        </label>
      </div>
      <p aria-live="polite" className="marketplace-result-count">
        当前页找到 {visibleItems.length} 个已审核发布。
      </p>
      {visibleItems.length === 0 ? (
        <div className="marketplace-empty-state">
          <p>暂时没有符合条件的公开条目。</p>
          <span>可更换关键词或类型；审核通过的内容会在这里出现。</span>
        </div>
      ) : (
        <div className="marketplace-card-grid">
          {visibleItems.map((item) => (
            <MarketplaceItemCard item={item} key={item.id} />
          ))}
        </div>
      )}
    </section>
  );
}

export function MarketplaceItemCard({
  item,
}: Readonly<{ readonly item: MarketplaceExplorerItem }>): React.JSX.Element {
  const price =
    item.priceCents === null ? '免费使用' : `¥${(item.priceCents / 100).toLocaleString('zh-CN')}`;

  return (
    <article className="marketplace-item-card">
      <div className="marketplace-item-card-topline">
        <span>{item.type}</span>
        <span>{item.category}</span>
      </div>
      <div className="marketplace-item-card-copy">
        <h2>{item.title}</h2>
        <p>{item.description}</p>
      </div>
      <ul aria-label="标签" className="marketplace-tag-list">
        {item.tags.slice(0, 4).map((tag) => (
          <li key={tag}>{tag}</li>
        ))}
      </ul>
      <dl className="marketplace-item-metadata">
        <div>
          <dt>作者</dt>
          <dd>
            {item.creator.displayName}
            {item.creator.verified ? ' · 已验证' : ''}
          </dd>
        </div>
        <div>
          <dt>评价</dt>
          <dd>
            <Star aria-hidden="true" size={14} strokeWidth={1.75} />
            {item.rating === null ? '暂无' : item.rating.toFixed(1)} / {item.ratingCount}
          </dd>
        </div>
      </dl>
      <footer className="marketplace-item-card-footer">
        <span>{price}</span>
        <span>
          {item.usageCount.toLocaleString('zh-CN')} 次调用 · {item.favoriteCount} 收藏
        </span>
        <Link aria-label={`查看 ${item.title}`} href={`/marketplace/${item.slug}`}>
          <span>查看</span>
          <ArrowUpRight aria-hidden="true" size={16} strokeWidth={1.75} />
        </Link>
      </footer>
    </article>
  );
}
