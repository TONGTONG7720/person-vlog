# Tong Developer Brand

一个面向个人品牌、技术案例与合作转化的开发者官网。项目已完成首页叙事、案例与内容页面、联系入口、SEO 部署准备，以及内嵌的 `Tong Assistant` 网站顾问。

## 当前能力

- 首页包含 Hero、About、Skills、精选项目、服务、合作流程、博客预览、开源与社交证明、联系 CTA。
- 已提供 `/about`、`/projects`、`/projects/[slug]`、`/services`、`/blog`、`/blog/[slug]`、`/contact` 等路由。
- 博客使用 MDX；项目、服务、技术栈和站点文案采用数据驱动结构。
- 已实现 Metadata、Open Graph、JSON-LD、robots、sitemap 和动态详情页 SEO。
- 已实现 `Tong Assistant`：基于站内知识库回答能力、案例、服务、合作方式和技术方向问题，并提供相关站内链接。
- 已实现隐私优先的增长分析：生产环境异步加载 Vercel Web Analytics，本站只记录白名单事件并在 `/admin/analytics` 聚合真实的访问、内容热度和联系转化数据。
- 已实现 `/admin/crm/*`：官网咨询会转为带来源和评分的线索，可通过看板推进、记录跟进、创建任务、方案、客户项目和首期自动化规则。
- 已实现 SaaS 商业化基础：Free、Pro、Team、Enterprise 套餐、试用与用量限制、组织账单、Stripe Checkout/Webhook 适配、订阅生命周期和商业运营数据页。

## 当前技术栈

- Next.js 16（App Router）、React 19、TypeScript（strict）
- Tailwind CSS 4、CSS Variables 设计令牌、Radix Dialog
- Framer Motion、GSAP、Lenis、React Three Fiber / Three.js
- MDX、Zod、React Hook Form、NextAuth（凭据登录）
- PostgreSQL、Prisma、Vercel Blob（可选媒体存储）、Vercel Web Analytics
- ESLint、Prettier、Vitest、pnpm
- GitHub Actions、Husky、Commitlint、Playwright、Sentry、Vercel Speed Insights

## 本地运行

1. 安装依赖：`pnpm install`
2. 复制环境变量模板：PowerShell 下执行 `Copy-Item .env.example .env.local`
3. 启动开发服务器：`pnpm dev`
4. 访问 `http://localhost:3000`

未配置 AI 模型时，网站和助手均可正常运行。助手会使用受限的本地站内知识引导，不会向第三方模型发送问题。

## 可用命令

| 命令                  | 用途                               |
| --------------------- | ---------------------------------- |
| `pnpm dev`            | 启动开发服务器                     |
| `pnpm build`          | 创建生产构建                       |
| `pnpm start`          | 启动生产服务                       |
| `pnpm test`           | 执行 Vitest 测试                   |
| `pnpm test:unit`      | 执行 Vitest 单元测试               |
| `pnpm test:e2e`       | 执行 Playwright 冒烟测试           |
| `pnpm test:ci`        | 执行格式、Lint、类型和单元测试门禁 |
| `pnpm lint`           | 执行 ESLint                        |
| `pnpm typecheck`      | 执行 TypeScript 检查               |
| `pnpm format`         | 格式化项目文件                     |
| `pnpm format:check`   | 检查 Prettier 格式                 |
| `pnpm prisma:migrate` | 在本地创建并应用 Prisma 迁移       |
| `pnpm prisma:deploy`  | 在生产数据库应用已提交的迁移       |
| `pnpm prisma:seed`    | 初始化管理员和现有内容数据         |

## 目录说明

| 目录                                        | 当前职责                                               |
| ------------------------------------------- | ------------------------------------------------------ |
| `src/app`                                   | 页面、API 路由、根布局、SEO 路由                       |
| `src/ai`                                    | 助手知识库、检索、提示词、安全校验、模型适配与流式响应 |
| `src/components/assistant`                  | 悬浮入口、聊天窗口、消息和输入组件                     |
| `src/components/sections`                   | 首页各叙事区块                                         |
| `src/components/navigation`、`layout`、`ui` | 导航、页脚和可复用基础组件                             |
| `src/components/three`                      | Hero 的按需加载 3D 场景                                |
| `src/content/blog`                          | MDX 博客内容和索引                                     |
| `src/data`                                  | 项目、服务、技能、合作流程等内容数据                   |
| `src/config`                                | 站点、导航、社交、联系和助手配置                       |
| `src/lib/analytics.ts`、`src/lib/utm.ts`    | 统一事件入口、会话级 UTM 来源记录                      |
| `src/server/analytics`                      | 受限事件限流与后台真实数据聚合                         |
| `src/styles`                                | 设计令牌、响应式样式和各模块样式                       |
| `src/types`                                 | 领域类型与聊天消息类型                                 |
| `src/app/admin`、`src/components/admin`     | 受保护的 CMS 路由、后台壳、数据表与内容表单            |
| `src/actions/admin`、`src/server/cms`       | 服务器操作、认证、数据库、存储与后台查询               |
| `prisma`                                    | PostgreSQL Schema、迁移和初始化脚本                    |

## Tong Assistant

助手默认不自动弹出，用户点击右下角入口后才会按需加载聊天窗口：桌面端为右下角 `400 × 600px` 窗口，移动端为底部 Drawer。会话仅保存在浏览器 `sessionStorage` 中；API 不默认记录问题、邮箱或 IP。

知识库位于 `src/ai/knowledge/`，包含个人介绍、技术栈、项目、服务、合作流程、博客、FAQ 和联系信息。回答使用受限检索与固定站内链接，不会捏造客户、成果、价格、经历或交付周期。

API 路径为 `POST /api/assistant`。它有请求体大小、单条消息长度、频率、输出长度和提示词注入防护；回答使用流式文本返回。模型调用异常时会显示安全的联系引导，不暴露内部错误。

## CMS 管理后台

后台入口为 `/admin/login`，登录成功后可管理项目、博客、服务、咨询留言、CRM 线索、AI 知识、媒体和公开站点配置。后台页面设置为 `noindex`，且中间件、Server Action 与服务器查询都会检查管理员会话；密码只保存 bcrypt 哈希。

首次接入 PostgreSQL（本地或 Supabase）时：

1. 从 `.env.example` 复制出 `.env.local`，设置 `DATABASE_URL`、随机 `AUTH_SECRET` 和唯一的 `ADMIN_EMAIL`。
2. 设置 `ADMIN_PASSWORD_HASH`；或者只在第一次执行 seed 时设置至少 8 位的 `ADMIN_PASSWORD`，完成后立即从环境变量删除它。
3. 执行 `pnpm prisma:deploy` 应用已提交的数据库迁移。
4. 执行 `pnpm prisma:seed`：会创建管理员，并导入当前项目、文章、服务和站内知识的初始数据。
5. 访问 `http://localhost:3000/admin/login` 登录。

`BLOB_READ_WRITE_TOKEN` 为可选项；配置后，`/admin/media` 可以上传最大 4 MB 的 AVIF、JPEG、PNG 与 WebP 文件。媒体 URL 可复制到项目或博客的封面字段。

AI 知识库保存后，助手会优先读取数据库中已启用的条目；数据库未配置、无条目或短暂不可用时，助手回退到项目中的 Markdown 基础知识。`syncStatus` 预留给 pgvector/Embedding 等语义检索增强，当前未配置向量服务时不会假称已同步。

## CRM 与自动化获客

官网 Contact 表单在数据库已配置时会在一次事务中创建 `Message`、`Lead`、状态活动和首个内部跟进任务。线索来源优先使用首个安全 UTM 来源，其次使用站内 CTA 来源；AI Assistant 仅记录受限的意图分类，不保存对话内容，也不会自动生成线索。

后台路径如下：

- `/admin/crm/dashboard`：真实线索、转化、来源与任务概览。
- `/admin/crm/leads`：可拖拽推进的阶段看板，卡片内也有触摸与键盘可用的状态选择。
- `/admin/crm/projects`：成交线索自动转入的客户项目与交付阶段。
- `/admin/crm/tasks`：内部跟进任务。
- `/admin/crm/settings`：确认邮件、管理员通知和 24 小时内部提醒的开关。

如需启用事务邮件，在服务端环境变量中设置：

```text
RESEND_API_KEY=
CRM_EMAIL_FROM=Tong <hello@your-domain.com>
CONTACT_EMAIL=you@your-domain.com
CRM_SECRET=
```

`CRM_EMAIL_FROM` 必须是已在 Resend 验证的发件域名。未配置邮件变量时，CRM 仍会创建和管理线索，但不会伪称邮件已送达。

## SaaS 客户协作空间

阶段二十五将官网升级为多租户协作平台。数据边界为 `User → Organization → Workspace → WorkspaceProject → ProjectTask`；每一次项目、任务、文档、文件与项目 AI 查询都会同时检查当前会话的成员关系与 `organizationId`，不会仅靠前端菜单隐藏权限。

- `/signup`：创建企业空间、Owner 账户、默认 `General` 工作区与 Free 订阅占位。
- `/client/login`、`/client`：客户登录与组织隔离的项目入口。
- `/dashboard/projects/[id]`：项目概览、Todo / Doing / Review / Done 看板、私有文件、Markdown 文档、动态时间线与项目专属 AI 面板。
- `/admin/saas`：管理员查看实际的组织、成员、套餐、订阅边界与审计记录。
- `/api/v1/openapi`：当前版本的 API 路径说明；受保护接口要求客户门户会话，并可通过 `organization` 查询参数选择自己有成员关系的企业空间。

首次启用协作空间时：

1. 在 PostgreSQL 中启用 `pgvector` 扩展（本项目的阶段二十五迁移会执行 `CREATE EXTENSION IF NOT EXISTS vector`）。
2. 配置 `DATABASE_URL` 与 `AUTH_SECRET`，再执行 `pnpm prisma:deploy` 和 `pnpm prisma:seed`。
3. 如需上传项目文件，配置 `BLOB_READ_WRITE_TOKEN`。文件以 Vercel Blob 私有路径保存，下载始终通过组织权限 API；不会暴露公开 Blob 链接。
4. 如需项目 AI 问答，继续配置已有的服务端 AI 模型变量。Markdown 文档会写入 `Organization + Workspace` 专属知识命名空间；向量字段已预留，但本期不会自动生成 Embedding 或接入真实扣费。

阶段二十五建立了套餐、`Subscription`、`Invoice` 与 `Payment` 的数据边界；阶段二十六已在此基础上接入 Stripe Checkout 与经签名校验的 Webhook。实时聊天与跨组织知识检索仍不在当前范围内。

## SaaS 套餐、账单与 Stripe

阶段二十六将协作空间补充为可商业化的 SaaS：`/pricing` 展示 Free、Pro、Team 和 Enterprise 套餐；组织 Owner 可在 `/dashboard/settings/billing` 查看真实套餐、用量和试用/续费时间。项目、工作区、成员、私有存储、私有知识库和 AI 调用均在服务端通过套餐限制校验，不依赖前端隐藏按钮。

启用真实 Stripe 支付前，先完成 PostgreSQL 迁移与种子初始化，并在部署环境中设置：

```text
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
```

随后在 Stripe Dashboard 将 Webhook 指向 `https://your-domain.com/api/webhooks/stripe`，订阅以下事件：`checkout.session.completed`、`invoice.paid`、`customer.subscription.updated`、`customer.subscription.deleted`。Webhook 使用原始请求体与 Stripe Signature 验证，事件按第三方事件 ID 幂等记录。不要把这些变量、支付卡信息或 Stripe 原始事件载荷放进前端、数据库配置表或 Git。

`/admin/business` 显示实际 MRR、ARR、转化、试用、流失和产品使用汇总；`/admin/billing` 显示实际套餐、订阅和支付记录。数据库或 Stripe 未配置时，这些页面会显示配置/空状态而不会伪造支付或收入数据。付费订阅的套餐变更首期保留为人工支持入口，取消续费会通过 Stripe 在当前周期结束时生效，且不会立即删除组织数据。

## 数据分析与隐私

生产环境会异步启用 Vercel Web Analytics；部署到 Vercel 后，还需要在项目的 **Analytics** 面板手动启用 Web Analytics。站内事件 API 为 `POST /api/analytics`，仅接受以下受限事件：页面访问、项目查看、文章阅读、服务查看、联系点击、联系提交、AI 使用分类、文章停留/完读和项目动作。

- 不保存 IP、设备指纹、密码、联系表单正文、邮箱或 AI 问题正文。
- UTM 首次来源只保存在浏览器 `sessionStorage`，不建立跨会话识别。
- 开发环境不发送前台统计事件；浏览器设置 `Do Not Track` 时也不会发送。
- PostgreSQL 迁移后，管理员可访问 `/admin/analytics` 查看真实 PV、内容排行、联系来源、AI 分类与匿名事件漏斗。未配置数据库时后台明确显示配置状态，不填充演示数据。
- 用户可在 `/privacy` 查看公开隐私说明。

## AI 模型环境变量

以下变量均仅在服务端读取，绝不能加上 `NEXT_PUBLIC_` 前缀：

```text
# 未填写模型配置时：使用本地受限知识引导
AI_PROVIDER=openai
AI_MODEL=
OPENAI_API_KEY=

# 可选：Anthropic
ANTHROPIC_API_KEY=

# 可选：Gemini
GEMINI_API_KEY=

# 可选：本地 / OpenAI 兼容模型
AI_BASE_URL=
AI_API_KEY=

# 可选：后续向量 Embedding Provider 配置
AI_EMBEDDING_MODEL=
AI_EMBEDDING_API_KEY=
```

- `AI_PROVIDER=openai`：设置 `AI_MODEL` 与 `OPENAI_API_KEY`。
- `AI_PROVIDER=anthropic`：设置 `AI_MODEL` 与 `ANTHROPIC_API_KEY`。
- `AI_PROVIDER=gemini`：设置 `AI_MODEL` 与 `GEMINI_API_KEY`。
- `AI_PROVIDER=local`：设置 `AI_MODEL`、`AI_BASE_URL`，必要时设置 `AI_API_KEY`；服务需提供 OpenAI 兼容的 `/chat/completions` 接口。

## AI SaaS Platform

阶段二十七在协作空间上增加了组织级 AI 产品层：`/dashboard/ai` 用于创建 AI Workspace、发布模板化 Assistant、上传 PDF/DOCX/Markdown/TXT 文档、查看处理状态与签发 API Key；`/dashboard/ai/[assistantId]` 提供带 Sources 的 SSE 流式问答；`/admin/ai-platform` 提供组织、模型、文档作业、Token 与成本的脱敏运营汇总。

- 所有 AI Workspace、Assistant、Document、Vector Chunk、Job、Usage 和 API Key 都带有 `organizationId`；检索还必须带 `workspaceId`，角色受限文档会按成员角色再次筛选。
- 文档先进入 PostgreSQL 持久化处理任务，再通过受保护的 `POST /api/v1/ai/documents/:id/process` 执行解析与分块。当前部署不依赖 Redis/BullMQ，因此此接口适合作为轻量作业触发器；高并发生产部署可将同一任务表交给独立队列 worker 消费。
- `AiVectorDocument` 已保留 pgvector 字段。未配置 Embedding Provider 时，RAG 使用同一租户边界内的词法检索回退，不会伪造语义向量结果；配置 Embedding Provider 后可在后续 worker 中写入向量并切换相似度查询。
- `POST /api/v1/ai/chat` 支持已登录组织成员或 `Authorization: Bearer tai_…` 的企业 API Key。API Key 只保存 SHA-256 哈希，明文只在创建响应中返回一次；API 访问同时检查套餐、组织、助手和文档权限。
- Pro 默认包含 100,000 AI Token/月，Team 默认包含 1,000,000 AI Token/月；Token、调用次数、文档数、助手数和存储都由服务端套餐限制执行。模型未配置或文件存储未配置时接口返回真实不可用状态，不模拟成功。

## Enterprise Platform

阶段二十九在原有多租户层之上增加 `Enterprise → Organization → Department → Workspace` 范围：成员、核心协作资源、AI 知识、审计与 API Key 均由服务端同时校验 enterprise、organization 和需要时的 workspace 范围。企业安全中心位于 `/dashboard/security`，全局运营概览位于 `/admin/enterprise`，审计后台位于 `/admin/security/audit`。

- 企业角色支持 Enterprise Owner、Security Admin、Department Admin、Member 与 Viewer，并可通过资源授权补充细粒度访问。
- API Key 只保存哈希，支持 scope、过期、禁用和轮换；`/api/v1/gateway/agent/chat` 是受 scope、套餐、限流、并发和 Token 配额约束的企业入口。
- 企业文档在索引前进行密钥、敏感信息和 prompt injection 检查；高风险内容会阻止或进入安全复核，不会跨企业检索。
- 域名通过 DNS TXT 验证；SSO 支持 SAML、OIDC、OAuth2 的安全配置与发现边界。真实登录需要企业提供 IdP metadata 和服务端 Secret Store 中的凭证。
- 管理员会收到成员加入、角色变更及安全事件的站内通知；安全策略、SSO、域名和 AI 安全事件同时保留企业审计记录。

私有部署、备份恢复和合规边界见 [企业运维索引](docs/enterprise-operations.md)。生产数据库应用本阶段迁移前，请先完成备份并执行 `pnpm prisma:deploy`。

## AI 自动化运营

迁移并 seed 后，管理员可从 `/admin/ai` 使用受保护的 AI Business Copilot：分析 CRM 线索、生成待审核方案、会议总结、内容建议、知识草稿和项目任务计划；Prompt 版本、调用日志、Token 限额和通知渠道分别位于 `/admin/ai/prompts`、`/admin/ai/logs`、`/admin/ai/settings`。

- 新线索会在不阻塞咨询保存的前提下异步请求 AI 分析；模型未配置、超出额度或返回异常时，CRM 会保留并转入人工处理。
- 方案、内容、知识与任务均不会自动发送、发布、启用或创建。内容草稿需要先在 AI 中心点击“转为博客草稿”，再到文章后台编辑并手动发布；项目任务需要管理员明确确认后才写入 CRM。
- AI 日志只存 Agent 类型、结果、模型、Token 和成本字段，不存客户正文、会议记录、Prompt 或 API Key。模型密钥始终通过现有服务端环境变量配置，后台数据库只保存模型名称、优先级和额度。
- 首次部署阶段二十四时先执行 `pnpm prisma:deploy`，再执行 `pnpm prisma:seed` 以创建默认 Prompt 与通知渠道。

## 开发规范

- 视觉令牌、响应式、动效和无障碍约束以 `DESIGN.md` 为准。
- 业务组件不直接硬编码颜色、间距、圆角或动效时长。
- 客户端交互保持在最小 Client Component 叶节点；页面默认使用 Server Component。
- 不提交 `.env`、构建产物、日志、真实密钥或没有来源的媒体文件。
- 未提供的社交链接只保留 planned 状态，不使用虚假地址。

## Vercel 部署准备

项目可直接作为 Next.js 项目导入 Vercel，不需要额外的 `vercel.json`。至少在 Production 环境设置：

```text
NEXT_PUBLIC_SITE_URL=https://your-domain.com
CONTACT_EMAIL=
RESEND_API_KEY=
CRM_EMAIL_FROM=
```

如需启用云端模型，再按上一节添加对应的 AI 环境变量。`next.config.ts` 已将助手知识库纳入 API 路由的部署追踪范围；未配置模型不会阻止部署或基础助手使用。部署前执行 `pnpm build`。

如启用 CMS 或 SaaS 协作空间，在部署数据库迁移后设置同一组 `DATABASE_URL`、`AUTH_SECRET`、`ADMIN_EMAIL` 和可选的 `BLOB_READ_WRITE_TOKEN`。阶段二十五还要求 PostgreSQL 可启用 `pgvector` 扩展。不要把 API 密钥、数据库 URL、密码或 bcrypt 哈希写入公开代码、前端环境变量或站点配置表。

增长分析复用同一 PostgreSQL 数据库：部署更新后执行 `pnpm prisma:deploy`，以创建 `AnalyticsEvent` 表与索引。Vercel Analytics 不需要把额外密钥放进环境变量；只需在 Vercel 项目控制台启用它。

## 生产运维与 CI/CD

项目采用 GitHub Flow：`feature/*` → `develop`（Preview）→ `main`（Production）。`main` 不直接开发；提交采用 Conventional Commits，Husky 会在本地提交前检查格式、Lint 与 TypeScript。

GitHub Actions 会在 PR 与 `develop`/`main` 推送时执行格式、Lint、类型、Vitest 与生产构建。`deploy.yml` 在验证通过后用 Vercel CLI 发布 Preview 或 Production，并且只在 Production 路径执行 `pnpm prisma:deploy`。

已接入 Sentry 错误监控、Vercel Speed Insights、结构化脱敏日志、`/api/health` 和 `/admin/system`。完整的环境变量、GitHub Secrets、部署、迁移、备份、回滚、Uptime 与安全扫描操作说明见 [docs/operations.md](docs/operations.md)。
