# 企业私有部署

本项目提供 Docker Compose 的私有部署基础：`web`、`postgres`（含 pgvector）、`redis`、`worker` 和按需运行的 `migrate` 服务。所有机密均从 `.env.enterprise` 或部署平台的 Secret Store 读取，绝不写入数据库的 SSO 配置、站点配置或客户端代码。

## 首次部署

1. 复制 `.env.enterprise.example` 为 `.env.enterprise`，替换所有示例密码与域名。
2. 在生产环境额外设置 `AI_*`、`BLOB_READ_WRITE_TOKEN`、Stripe、邮件及 Sentry 变量；不要使用 `NEXT_PUBLIC_` 暴露任何密钥。
3. 构建并启动依赖：`docker compose --env-file .env.enterprise up -d postgres redis`。
4. 应用前向 Prisma 迁移：`docker compose --env-file .env.enterprise --profile migration run --rm migrate`。
5. 启动应用：`docker compose --env-file .env.enterprise up -d web worker`。
6. 访问 `/api/health`，再使用真实管理员账户进入 `/admin/enterprise` 和 `/dashboard/security`。

## SSO 与 Gateway

- SSO 只保存 Azure AD、Google Workspace 或 Okta 的公开 metadata、URL、Client ID 和**环境变量名**。真实 client secret、SAML 签名证书必须只放在 Secret Store。
- 在 `/dashboard/security` 添加域名后，将页面给出的 TXT 值写入 DNS，点击验证。只有已验证域名、HTTPS metadata/authorization URL 和已存在的 secret 环境变量同时满足时，连接才会启用。
- Gateway 同时执行 API Key scope、套餐 API 权益、固定窗口请求数、并发数和既有 AI Token 用量检查。当前请求/并发限流是单进程实现；Compose 已部署 Redis，但跨实例的 Redis 限流适配器需要在高可用部署时接入，不要将单机内存限流误认为全局配额。

## 当前 worker 边界

`worker` 是长期运行的队列承载位，当前文档处理仍需由受保护的 API 显式触发。这样不会在没有队列、扫描或 Embedding 凭据时悄悄执行任务。接入 Redis/BullMQ 或云队列后，应让 worker 消费现有 `AiDocumentJob` 表，并保留本阶段的 enterprise/organization/workspace 过滤和 AI 安全扫描。
