import { NextResponse } from 'next/server';

const saasOpenApiDocument = {
  info: {
    description:
      '客户门户与企业 Gateway 的组织隔离接口。会话接口要求有效成员关系；Gateway 接口要求受 scope、过期和限流控制的 Bearer API Key。',
    title: 'Tong Collaboration API',
    version: '1.0.0',
  },
  openapi: '3.1.0',
  paths: {
    '/api/v1/auth/register': { post: { summary: '创建企业空间和 Owner 账户' } },
    '/api/v1/agent/chat': {
      post: {
        summary: '通过 Bearer AI API Key 调用已审核发布的 Marketplace Agent',
      },
    },
    '/api/v1/gateway/agent/chat': {
      post: { summary: '通过 Enterprise API Gateway 以 agent.execute scope 流式调用 AI Assistant' },
    },
    '/api/v1/ai/api-keys': {
      get: { summary: '读取当前企业的脱敏 AI API Key 列表' },
      post: { summary: '签发带最小 scope 和可选过期时间的 AI API Key' },
    },
    '/api/v1/ai/api-keys/{id}': {
      delete: { summary: '永久删除当前企业范围内的已失效 AI API Key' },
    },
    '/api/v1/ai/api-keys/{id}/disable': {
      post: { summary: '禁用当前企业范围内的 AI API Key' },
    },
    '/api/v1/ai/api-keys/{id}/rotate': {
      post: { summary: '轮换当前企业范围内的 AI API Key，并撤销旧 Key' },
    },
    '/api/v1/enterprise/departments': {
      get: { summary: '读取当前企业组织的部门列表' },
      post: { summary: '在当前企业组织中创建部门' },
    },
    '/api/v1/enterprise/export': {
      get: { summary: '由 Enterprise Owner 导出当前企业的可携带数据' },
    },
    '/api/v1/enterprise/security': {
      get: { summary: '读取当前企业安全中心概览' },
      patch: { summary: '更新当前企业安全策略' },
    },
    '/api/v1/enterprise/security/audit': {
      get: { summary: '搜索和筛选当前企业的审计事件' },
    },
    '/api/v1/enterprise/security/audit/export': {
      get: { summary: '导出当前企业的审计 CSV' },
    },
    '/api/v1/enterprise/security/documents/{id}/approve': {
      post: { summary: '批准需要人工复核的企业 AI 知识文档' },
    },
    '/api/v1/enterprise/security/domains': {
      post: { summary: '创建企业 DNS TXT 域名验证令牌' },
    },
    '/api/v1/enterprise/security/domains/{id}/verify': {
      post: { summary: '验证企业 DNS TXT 域名记录' },
    },
    '/api/v1/enterprise/security/sso': {
      put: { summary: '保存企业 SAML、OIDC 或 OAuth2 的脱敏 SSO 配置' },
    },
    '/api/v1/enterprise/sso/discovery': {
      get: { summary: '为已验证域名发现已启用的企业 SSO 配置' },
    },
    '/api/v1/billing': { get: { summary: '读取当前组织的套餐、订阅和使用量概览' } },
    '/api/v1/projects': {
      get: { summary: '读取当前组织项目' },
      post: { summary: '创建当前组织项目' },
    },
    '/api/v1/projects/{id}': { get: { summary: '读取当前组织的项目协作空间' } },
    '/api/v1/projects/{id}/tasks': { post: { summary: '创建当前项目任务' } },
    '/api/v1/projects/{id}/files': { post: { summary: '上传私有项目文件' } },
    '/api/v1/projects/{id}/assistant': { post: { summary: '查询当前项目知识库' } },
    '/api/v1/marketplace/items': {
      get: { summary: '分页读取已审核发布的 Marketplace 条目' },
      post: { summary: '在当前企业空间创建 Marketplace 草稿' },
    },
    '/api/v1/marketplace/items/{id}/submit': {
      post: { summary: '把当前企业空间的草稿提交人工审核' },
    },
    '/api/v1/marketplace/items/{id}/versions': {
      post: { summary: '创建 Marketplace 发布的新版本并重新进入审核流程' },
    },
    '/api/v1/subscription': { post: { summary: '创建 Stripe Checkout 或预约订阅取消' } },
    '/api/v1/usage': { get: { summary: '读取当前组织的套餐使用量' } },
    '/api/v1/workspaces': { post: { summary: '创建当前组织工作区' } },
  },
} as const;

export function GET(): NextResponse {
  return NextResponse.json(saasOpenApiDocument, {
    headers: { 'Cache-Control': 'public, max-age=3600' },
  });
}
