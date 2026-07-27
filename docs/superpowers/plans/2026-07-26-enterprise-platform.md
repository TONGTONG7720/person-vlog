# Enterprise Platform Layer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将现有组织级 SaaS 升级为可运行的企业层基础：企业/部门层级、企业角色与资源授权、审计与安全中心、SSO 配置边界、受控 API Gateway、AI 内容安全与私有部署准备。

**Architecture:** `Enterprise` 是组织的上层租户，`Organization`、`Department`、成员和关键 AI/协作资源都带有企业范围。服务端通过 `EnterpriseContext` 与统一的 scope helper 组合 `enterpriseId + organizationId + workspaceId` 过滤条件；浏览器只获取脱敏概览。外部 SSO 凭证不落库：连接仅保存公开元数据和环境变量引用，真实 IdP 回调待管理员配置证书、metadata 与回调地址后启用。

**Tech Stack:** Next.js 16 App Router、TypeScript、Prisma/PostgreSQL、NextAuth、Zod、Vitest、现有 CSS token 设计系统、Docker Compose。

## Global Constraints

- 不覆盖当前工作区内任何既有文件或用户未追踪内容；在现有 `main` 工作区进行增量修改，用户已明确授权执行本阶段。
- 现有 `Enterprise` 计费套餐已经存在，保留并扩充其企业功能边界，不重复创建套餐。
- 所有新增外部输入都在 Route 边界使用 Zod 解析；API、SSO 与文件安全接口不接受或返回明文密钥。
- 新增企业资源查询必须组合企业、组织与需要时的工作区范围；已有资源通过所属组织的企业范围校验。
- 数据库迁移必须前向兼容：为既有 Organization 创建对应 legacy Enterprise 后再收紧企业外键。
- UI 沿用 `DESIGN.md` 的深色企业工作台、细边框、真实空状态、响应式与 reduced-motion 规范；不添加营销式虚假指标或模拟数据。
- 不引入 SAML/OIDC 第三方 SDK 或伪造真实 SSO 成功；本阶段交付连接配置、域验证、发现与安全重定向架构，真实 IdP 握手需要客户提供元数据与凭证。
- 验证以用户要求的 `pnpm typecheck`、`pnpm lint`、`pnpm test`、`pnpm build` 和本地页面可访问性为准，不额外扩大为耗时的审计流程。

---

## File Structure

| 路径                                                                                   | 职责                                                                     |
| -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| `prisma/schema.prisma`                                                                 | 企业、部门、SSO、域验证、安全策略、资源授权、企业审计和增强 API Key 模型 |
| `prisma/migrations/20260726130000_add_enterprise_platform/migration.sql`               | 前向迁移与 legacy Enterprise 回填                                        |
| `src/server/enterprise/*`                                                              | 角色、隔离、审计、SSO、安全扫描、Gateway、查询服务与输入契约             |
| `src/server/saas/auth.ts`、`rbac.ts`、`scoping.ts`                                     | EnterpriseContext、扩展角色和组合租户 scope                              |
| `src/server/saas/ai-*.ts`、`projects.ts`、`registration.ts`                            | 为新建及敏感查询注入企业范围、Key scope 和安全扫描                       |
| `src/app/api/v1/enterprise/**`、`src/app/api/v1/gateway/**`                            | 企业管理、审计导出、SSO 发现、Gateway 基础接口                           |
| `src/app/dashboard/security/page.tsx`、`src/app/admin/(protected)/enterprise/page.tsx` | 企业安全中心与企业管理员中心                                             |
| `src/components/enterprise/*`、`src/styles/enterprise.css`                             | 受控企业工作台 UI，遵循现有设计 token                                    |
| `Dockerfile`、`docker-compose.yml`、`.dockerignore`、`docs/enterprise-operations.md`   | 私有部署、配置、备份/恢复和合规操作说明                                  |
| `tests/enterprise-*.test.ts`                                                           | 角色、scope、SSO、API scope/rate limit 与 AI 安全的行为测试              |

## Task 1: 建立企业领域契约与测试红线

**Files:**

- Create: `tests/enterprise-rbac.test.ts`
- Create: `tests/enterprise-security.test.ts`
- Create: `tests/enterprise-sso.test.ts`
- Create: `tests/enterprise-gateway.test.ts`
- Create: `src/server/enterprise/rbac.ts`
- Create: `src/server/enterprise/security.ts`
- Create: `src/server/enterprise/sso.ts`
- Create: `src/server/enterprise/gateway.ts`
- Modify: `src/server/saas/rbac.ts`
- Modify: `src/server/saas/scoping.ts`

**Interfaces:**

- Produces `EnterpriseRole`、`EnterprisePermission`、`enterprisePermissions`、`hasEnterprisePermission()`。
- Produces `createEnterpriseScope()`、`enterpriseResourceWhere()`、`canAccessEnterpriseResource()`。
- Produces `scanEnterpriseAiContent()`，结果为 `ALLOW | REVIEW_REQUIRED | BLOCKED`。
- Produces `normalizeEnterpriseDomain()`、`createDomainVerificationToken()`、`isSsoConnectionReady()`。
- Produces `hasApiScope()` 与内存窗口 `EnterpriseGatewayRateLimiter`。

- [x] **Step 1: 先编写失败的纯函数测试**

覆盖 Enterprise Owner 全权限、Security Admin 仅安全权限、跨企业资源拒绝、域名归一化与非法 URL 拒绝、已过期/缺 scope Key 拒绝、私钥与 prompt injection 被识别。

- [x] **Step 2: 运行只包含新测试的 Vitest 命令并确认因模块尚不存在失败**

Run: `pnpm.cmd exec vitest run tests/enterprise-rbac.test.ts tests/enterprise-security.test.ts tests/enterprise-sso.test.ts tests/enterprise-gateway.test.ts`

- [x] **Step 3: 实现最小、严格类型的领域函数**

使用 readonly 类型、穷尽 switch 和 Zod 边界；不在纯函数中访问数据库或环境变量。

- [x] **Step 4: 再次运行新测试并确认通过**

Run: `pnpm.cmd exec vitest run tests/enterprise-rbac.test.ts tests/enterprise-security.test.ts tests/enterprise-sso.test.ts tests/enterprise-gateway.test.ts`

## Task 2: 扩展 Prisma 企业层与前向迁移

**Files:**

- Modify: `prisma/schema.prisma`
- Create: `prisma/migrations/20260726130000_add_enterprise_platform/migration.sql`
- Modify: `src/server/saas/defaults.ts`
- Modify: `src/server/saas/registration.ts`

**Interfaces:**

- Produces `Enterprise` → `Organization` → `Department` → `Workspace` → `WorkspaceProject` 的关系。
- Produces `EnterpriseDomain`、`SSOConnection`、`EnterpriseSecurityPolicy`、`ResourcePermissionGrant`。
- Produces增强 `AiApiKey`（`enterpriseId`、`scopes`、`expiresAt`）和 `AuditLog`（`enterpriseId`、`ipHash`）。

- [x] **Step 1: 更新 schema 并生成新企业枚举/关系**

保留旧 `OWNER`/`ADMIN` 角色以兼容已有成员，新增 `ENTERPRISE_OWNER`、`SECURITY_ADMIN`、`DEPARTMENT_ADMIN` 和成员状态。新增角色与权限定义能被 `ensureSaasDefaults()` 幂等写入。

- [x] **Step 2: 写入前向 SQL 迁移**

迁移先建表，再为每个旧 Organization 插入唯一 `legacy-<organizationId>` Enterprise，回填关联列，最后创建外键、索引和唯一约束；不删除任何旧数据。

- [x] **Step 3: 更新注册事务**

新注册先创建 Enterprise 和默认 General Department，再创建 Enterprise Owner Membership、Organization 和 General Workspace，并写入企业范围审计。

- [x] **Step 4: 生成 Prisma Client 并运行类型检查**

Run: `pnpm.cmd prisma:generate && pnpm.cmd typecheck`

## Task 3: 实现 EnterpriseContext、RBAC + Resource Permission 与审计

**Files:**

- Create: `src/server/enterprise/audit.ts`
- Create: `src/server/enterprise/access.ts`
- Create: `src/server/enterprise/queries.ts`
- Modify: `src/server/saas/auth.ts`
- Modify: `src/server/saas/api.ts`
- Modify: `src/server/saas/projects.ts`
- Modify: `src/server/saas/project-mutations.ts`
- Modify: `src/server/saas/workspace-knowledge.ts`
- Modify: `src/server/saas/ai-workspaces.ts`
- Modify: `src/server/saas/ai-document-jobs.ts`

**Interfaces:**

- `SaasContext` 新增 `enterprise`、成员 department/status，所有受保护服务可获得 `enterpriseId`。
- `requireEnterpriseResourcePermission()` 先验证企业/组织/工作区，再检查角色权限或显式授权。
- `writeEnterpriseAuditLog()` 仅持久化经脱敏的 metadata 与 HMAC IP hash。
- `getEnterpriseSecurityOverview()` 和 `getEnterpriseAdminOverview()` 只聚合当前企业真实数据。

- [x] **Step 1: 为 EnterpriseContext 与显式授权写失败测试**

覆盖不同 enterpriseId 即使 workspaceId 相同仍拒绝、单条 `document.read` grant 允许已授权文档、无 grant 的受限资源拒绝。

- [x] **Step 2: 在认证和主要协作/AI 查询中合并企业 scope**

将 `enterpriseId + organizationId + workspaceId` 放入 Prisma where；创建资源时从 context 写入 enterpriseId，避免客户端提交租户标识。

- [x] **Step 3: 接入审计写入与查询**

成员/权限、安全策略、Key、文档访问/AI 使用、SSO 设置和 Gateway 拒绝事件有一致的 action/resource 记录。IP 仅存不可逆哈希。

- [x] **Step 4: 运行企业单元测试与相关现有 SaaS 测试**

Run: `pnpm.cmd exec vitest run tests/enterprise-rbac.test.ts tests/saas-rbac.test.ts tests/saas-scoping.test.ts`

## Task 4: 实现 SSO、API Key Gateway 与 AI 企业安全接口

**Files:**

- Create: `src/server/enterprise/validation.ts`
- Create: `src/server/enterprise/sso-service.ts`
- Create: `src/server/enterprise/gateway-service.ts`
- Create: `src/app/api/v1/enterprise/security/audit/route.ts`
- Create: `src/app/api/v1/enterprise/security/audit/export/route.ts`
- Create: `src/app/api/v1/enterprise/security/sso/route.ts`
- Create: `src/app/api/v1/enterprise/security/domains/route.ts`
- Create: `src/app/api/v1/enterprise/sso/discovery/route.ts`
- Create: `src/app/api/v1/gateway/agent/chat/route.ts`
- Create: `src/app/api/v1/ai/api-keys/[id]/rotate/route.ts`
- Modify: `src/server/saas/ai-api-keys.ts`
- Modify: `src/server/saas/validation.ts`
- Modify: `src/app/api/v1/ai/chat/route.ts`
- Modify: `src/app/api/v1/openapi/route.ts`

**Interfaces:**

- SSO/域名 API 仅接受安全白名单字段，返回挑战 TXT 记录与脱敏连接状态。
- API Key 创建/轮换只在签发时返回明文，存储 hash，执行 scope、expiry、revocation 和 plan-aware rate limit。
- `/api/v1/gateway/agent/chat` 是统一企业 API 入口，先经 Key scope、Enterprise scope 和 limiter，再复用当前 AI Chat 服务。

- [x] **Step 1: 写失败测试验证 Gateway 的最小权限、过期和限流行为**

测试没有 `agent.execute` scope、已撤销/过期 Key、超过窗口限额与跨企业 assistant 请求。

- [x] **Step 2: 实现 API Key 增强和轮换**

默认只发 `agent.execute` scope；管理 UI/API 能选择白名单 scope；轮换先签发新 hash、再撤销旧 Key，并写入审计。

- [x] **Step 3: 实现 SSO 管理、域验证与发现架构**

元数据拒绝 secret 字段和非 HTTPS redirect；未验证域或未就绪连接不返回 SSO 跳转。真实 SAML/OIDC callback 的环境引用不写入数据库。

- [x] **Step 4: 为文档处理和 Gateway 加入企业 AI 安全扫描**

上传/提取后检测注入和敏感凭据；BLOCKED 停止索引，REVIEW_REQUIRED 写审计并等待管理员确认，不泄露原始敏感文本。

- [x] **Step 5: 运行新增接口与安全测试**

Run: `pnpm.cmd exec vitest run tests/enterprise-security.test.ts tests/enterprise-sso.test.ts tests/enterprise-gateway.test.ts`

## Task 5: 实现企业安全中心与企业管理员中心

**Files:**

- Create: `src/app/dashboard/security/page.tsx`
- Create: `src/app/admin/(protected)/enterprise/page.tsx`
- Create: `src/components/enterprise/security-center.tsx`
- Create: `src/components/enterprise/enterprise-admin-overview.tsx`
- Create: `src/styles/enterprise.css`
- Modify: `src/components/saas/client-portal-header.tsx`
- Modify: `src/components/admin/admin-navigation.ts`
- Modify: `src/app/globals.css`
- Modify: `DESIGN.md`

**Interfaces:**

- `/dashboard/security` 仅显示当前 Enterprise 的真实安全策略、SSO/domain、API Key、风险提示和审计摘要。
- `/admin/enterprise` 仅显示全局管理员可见的 enterprise/organization/department/member/billing 运营概览。
- 不配置数据库时沿用真实的设置提示；不插入虚构指标。

- [x] **Step 1: 先更新 DESIGN.md 的阶段二十九工作台契约**

定义两条路由的布局、状态、响应式、空状态、审计表格、危险操作反馈和无障碍规则，再编写组件。

- [x] **Step 2: 实现小而聚焦的服务端页面和 Client 叶组件**

沿用 portal/admin layout、语义表格、真实 label 与既有 token；手机端按文档流堆叠，表格只在必要时横向滚动。

- [x] **Step 3: 连接导航与 CSS token 样式**

新增 Security 和 Enterprise 管理入口，确保无 JS / reduced-motion 仍可读。

- [x] **Step 4: 检查 375px、768px、1280px 的可视页面与关键焦点状态**

Run: `pnpm.cmd build && pnpm.cmd start`，随后验证 `/dashboard/security`、`/admin/enterprise` 未登录重定向与未配置数据库提示。

## Task 6: 私有部署、备份恢复与合规操作准备

**Files:**

- Create: `Dockerfile`
- Create: `docker-compose.yml`
- Create: `.dockerignore`
- Create: `docs/enterprise-operations.md`
- Modify: `.env.example`
- Modify: `docs/operations.md`

**Interfaces:**

- Compose 提供 `web`、`postgres`、`redis`、`worker` 服务的安全默认边界；敏感值全部从环境读取。
- 运维文档包含迁移、数据库/文件/知识库备份、恢复演练、导出、Vercel/Vault/AWS Secrets Manager 推荐项与 SSO 凭证管理限制。

- [x] **Step 1: 添加可构建的 Node 20 多阶段 Dockerfile 和最小 docker-compose**

镜像不复制 `.env*`、本地数据库、构建缓存或用户文件；web 启动前执行部署迁移的明确操作说明而非自动破坏性迁移。

- [x] **Step 2: 更新环境变量示例与企业运维说明**

加入 `ENTERPRISE_ENCRYPTION_KEY`、`AUDIT_IP_HASH_SALT`、SSO secret reference 约定与 backup/restore/export 步骤；不写入实际值。

- [x] **Step 3: 执行静态 Compose 校验**

Run: `docker compose config`（若本机 Docker 不可用，记录为环境限制，仍验证文件结构）。

## Task 7: 完整验证与收尾

**Files:**

- Modify: `docs/superpowers/plans/2026-07-26-enterprise-platform.md`（勾选已执行步骤）

- [x] **Step 1: 生成 Prisma client 并运行强制质量命令**

Run: `pnpm.cmd prisma:generate && pnpm.cmd typecheck && pnpm.cmd lint && pnpm.cmd test && pnpm.cmd build`

- [x] **Step 2: 使用生产构建启动本地服务并检查路由**

检查 `/marketplace`、`/dashboard/security`、`/admin/enterprise`、`/api/v1/openapi` 与未鉴权 Gateway 返回的真实状态码。

- [x] **Step 3: 更新执行计划勾选并输出阶段报告**

报告架构、RBAC/资源授权、SSO 边界、安全/AI 隔离、Docker/备份、验证结果及需由企业管理员提供的真实 IdP 凭证。
