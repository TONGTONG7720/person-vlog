import { ArrowRight, Blocks, ShieldCheck, Sparkles } from 'lucide-react';
import Link from 'next/link';

import { MarketplaceExplorer } from '@/components/marketplace/marketplace-explorer';
import { createMetadata } from '@/lib/metadata';
import { getPublicMarketplaceCatalog } from '@/server/marketplace/public-catalog';
import { marketplaceItemTypeValues } from '@/server/marketplace/validation';

export const dynamic = 'force-dynamic';

export const metadata = createMetadata({
  description: '浏览经过人工审核的 AI Agent、Workflow、Prompt、Template 和 Plugin 发布包。',
  path: '/marketplace',
  title: 'AI Builder Marketplace | 瞳瞳',
});

type MarketplacePageProps = Readonly<{
  readonly searchParams: Promise<
    Readonly<{
      readonly category?: string | readonly string[];
      readonly page?: string | readonly string[];
      readonly search?: string | readonly string[];
      readonly type?: string | readonly string[];
    }>
  >;
}>;

export default async function MarketplacePage({
  searchParams,
}: MarketplacePageProps): Promise<React.JSX.Element> {
  const query = await searchParams;
  const typeValue = readQueryValue(query.type);
  const type = marketplaceItemTypeValues.find((item) => item === typeValue);
  const page = Number(readQueryValue(query.page) ?? '1');
  const search = readQueryValue(query.search);
  const category = readQueryValue(query.category);
  const catalog = await getPublicMarketplaceCatalog({
    ...(category === undefined ? {} : { category }),
    page: Number.isFinite(page) ? page : 1,
    ...(search === undefined ? {} : { search }),
    ...(type === undefined ? {} : { type }),
  });

  return (
    <main className="marketplace-page">
      <section className="marketplace-hero">
        <div>
          <p className="marketplace-kicker">AI BUILDER MARKETPLACE / V1</p>
          <h1>把可复用的 AI 能力，交给真正需要它的人。</h1>
          <p>
            这里仅展示通过人工审核的 Agent、Workflow、Prompt、Template 和
            Plugin。公开条目与企业内部资料、密钥和私有知识库严格隔离。
          </p>
          <div className="marketplace-hero-actions">
            <Link href="/dashboard/ecosystem">
              <span>发布你的能力</span>
              <ArrowRight aria-hidden="true" size={17} strokeWidth={1.75} />
            </Link>
            <Link href="/developers/docs">Developer API</Link>
          </div>
        </div>
        <div aria-label="Marketplace 发布流程" className="marketplace-hero-diagram">
          <span>
            <Sparkles aria-hidden="true" size={18} /> 创建
          </span>
          <i aria-hidden="true" />
          <span>
            <ShieldCheck aria-hidden="true" size={18} /> 人工审核
          </span>
          <i aria-hidden="true" />
          <span>
            <Blocks aria-hidden="true" size={18} /> 公开使用
          </span>
        </div>
      </section>
      <section className="marketplace-directory-section">
        <header className="marketplace-directory-header">
          <div>
            <p className="marketplace-kicker">DISCOVER / CURATED</p>
            <h2>已审核发布。</h2>
          </div>
          <p>服务端按页加载；当前页用 Fuse.js 进行名称、标签、类型、分类和创作者的快速筛选。</p>
        </header>
        <MarketplaceExplorer
          items={catalog.items.map((item) => ({
            category: item.category,
            creator: item.creator,
            description: item.description,
            favoriteCount: item.favoriteCount,
            id: item.id,
            priceCents: item.priceCents,
            rating: item.rating,
            ratingCount: item.ratingCount,
            slug: item.slug,
            tags: item.tags,
            title: item.title,
            type: item.type,
            usageCount: item.usageCount,
          }))}
          {...(search === undefined ? {} : { search })}
        />
      </section>
      <section className="marketplace-cta-band">
        <div>
          <p className="marketplace-kicker">BUILD THE ECOSYSTEM</p>
          <h2>有一个可交付的 AI 方案？把它变成可审核的发布包。</h2>
        </div>
        <Link href="/dashboard/ecosystem">
          <span>前往创作者控制台</span>
          <ArrowRight aria-hidden="true" size={17} strokeWidth={1.75} />
        </Link>
      </section>
    </main>
  );
}

function readQueryValue(value: string | readonly string[] | undefined): string | undefined {
  return typeof value === 'string' && value.trim() !== '' ? value.trim() : undefined;
}
