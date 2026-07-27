import { ArrowRight, KeyRound, ShieldCheck, TerminalSquare } from 'lucide-react';
import Link from 'next/link';

type DeveloperApiDocsProps = Readonly<{
  readonly compact?: boolean;
}>;

export function DeveloperApiDocs({ compact = false }: DeveloperApiDocsProps): React.JSX.Element {
  return (
    <section aria-labelledby="developer-api-heading" className="developer-api-docs">
      <header>
        <p className="marketplace-kicker">DEVELOPER API / V1</p>
        <h1 id="developer-api-heading">把已审核 Agent 接入你的产品。</h1>
        <p>
          使用组织级 AI API Key 调用公开、已审核的
          Agent。每次请求会计入当前套餐额度，并保留可核验的使用记录。
        </p>
      </header>
      <div className="developer-api-grid">
        <article>
          <KeyRound aria-hidden="true" size={20} strokeWidth={1.65} />
          <h2>Authentication</h2>
          <p>在客户门户的 AI Platform 创建 Key。完整 Key 只展示一次，数据库仅保存不可逆 Hash。</p>
        </article>
        <article>
          <TerminalSquare aria-hidden="true" size={20} strokeWidth={1.65} />
          <h2>POST /api/v1/agent/chat</h2>
          <p>传入已发布 Agent 的 ID 与用户消息，返回真实模型回答和空的公开来源列表。</p>
        </article>
        <article>
          <ShieldCheck aria-hidden="true" size={20} strokeWidth={1.65} />
          <h2>Safety by default</h2>
          <p>私有知识库、未审核草稿和第三方插件不会通过公共 Agent API 访问或执行。</p>
        </article>
      </div>
      {compact ? null : (
        <>
          <pre aria-label="cURL 调用示例" className="developer-api-code">
            <code>{`curl -X POST https://your-domain.com/api/v1/agent/chat \\
  -H "Authorization: Bearer tai_your_key" \\
  -H "Content-Type: application/json" \\
  -d '{"agentId":"published-agent-id","message":"你好"}'`}</code>
          </pre>
          <div className="developer-api-actions">
            <Link href="/dashboard/ai">
              <span>管理 API Key</span>
              <ArrowRight aria-hidden="true" size={16} strokeWidth={1.75} />
            </Link>
            <Link href="/api/v1/openapi">
              <span>打开 OpenAPI JSON</span>
              <ArrowRight aria-hidden="true" size={16} strokeWidth={1.75} />
            </Link>
          </div>
        </>
      )}
    </section>
  );
}
