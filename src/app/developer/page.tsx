import { ArrowRight, Blocks, Code2, Store } from 'lucide-react';
import Link from 'next/link';

import { DeveloperApiDocs } from '@/components/marketplace/developer-api-docs';
import { createMetadata } from '@/lib/metadata';

export const metadata = createMetadata({
  description: '开发者开放平台：使用组织 API Key 调用人工审核后的 AI Agent，并查看用量与安全边界。',
  path: '/developer',
  title: 'Developer Platform | 瞳瞳',
});

export default function DeveloperPage(): React.JSX.Element {
  return (
    <main className="developer-page">
      <section className="developer-hero">
        <p className="marketplace-kicker">TONG / DEVELOPER PLATFORM</p>
        <h1>为可交付的 AI 能力，提供可控的接入方式。</h1>
        <p>
          从已审核的公开 Agent 开始，用现有企业 API Key、套餐限额和使用记录保持每一次接入可追溯。
        </p>
        <div>
          <Link href="/developers/docs">
            <span>阅读 API 文档</span>
            <ArrowRight aria-hidden="true" size={17} />
          </Link>
          <Link href="/marketplace">浏览 Marketplace</Link>
        </div>
      </section>
      <section className="developer-principles">
        <article>
          <Store aria-hidden="true" size={21} strokeWidth={1.55} />
          <h2>Human-reviewed</h2>
          <p>只有公开、已审核且仍启用的 Agent 可被 API 调用。</p>
        </article>
        <article>
          <Code2 aria-hidden="true" size={21} strokeWidth={1.55} />
          <h2>OpenAPI first</h2>
          <p>接口和认证方式可从 OpenAPI JSON 读取；Java、Python 与 JavaScript SDK 预留后续实现。</p>
        </article>
        <article>
          <Blocks aria-hidden="true" size={21} strokeWidth={1.55} />
          <h2>Bounded execution</h2>
          <p>公共 API 不执行第三方插件，也不跨越企业私有数据边界。</p>
        </article>
      </section>
      <DeveloperApiDocs compact />
    </main>
  );
}
