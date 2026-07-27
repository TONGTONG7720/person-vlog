import { BookOpenCheck, CodeXml, KeyRound } from 'lucide-react';

import { DeveloperApiDocs } from '@/components/marketplace/developer-api-docs';
import { createMetadata } from '@/lib/metadata';

export const metadata = createMetadata({
  description: 'AI Builder Marketplace Developer API 认证、接口、示例、OpenAPI 与 SDK 预留说明。',
  path: '/developers/docs',
  title: 'Developer API 文档 | 瞳瞳',
});

export default function DeveloperDocsPage(): React.JSX.Element {
  return (
    <main className="developer-docs-page">
      <DeveloperApiDocs />
      <section className="developer-docs-notes">
        <article>
          <KeyRound aria-hidden="true" size={20} strokeWidth={1.65} />
          <h2>1. 创建 API Key</h2>
          <p>登录客户门户，进入 AI Platform 后创建组织级 Key。请在创建时安全保存完整密钥。</p>
        </article>
        <article>
          <CodeXml aria-hidden="true" size={20} strokeWidth={1.65} />
          <h2>2. 调用发布 Agent</h2>
          <p>
            只传入 Marketplace 已公开的 Agent ID 和用户消息。错误会返回 400、401、403、404、409、429
            或 503。
          </p>
        </article>
        <article>
          <BookOpenCheck aria-hidden="true" size={20} strokeWidth={1.65} />
          <h2>3. 追踪用量</h2>
          <p>
            调用在组织套餐中计量，并写入 API 使用日志。SDK 将在接口稳定后分别提供 Java、Python 与
            JavaScript 版本。
          </p>
        </article>
      </section>
    </main>
  );
}
