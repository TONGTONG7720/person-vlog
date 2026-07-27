import { describe, expect, it } from 'vitest';

import {
  createMarketplaceItemRequestSchema,
  marketplaceItemVersionRequestSchema,
} from '../src/server/marketplace/validation';

describe('Marketplace 发布校验', () => {
  it('拒绝没有权限声明的 Plugin 发布包', () => {
    const result = createMarketplaceItemRequestSchema.safeParse({
      category: 'automation',
      description: '把企业数据接入受控的自动化流程。',
      manifest: { version: '1.0.0' },
      slug: 'unsafe-plugin',
      tags: ['automation'],
      title: '未声明权限的插件',
      type: 'PLUGIN',
      version: '1.0.0',
    });

    expect(result.success).toBe(false);
  });

  it('接受包含完整 Agent Package 的发布草稿', () => {
    const result = createMarketplaceItemRequestSchema.safeParse({
      category: 'support',
      description: '基于公开产品资料整理客服回答边界。',
      manifest: {
        description: '客服团队的公开 FAQ 助手。',
        model: 'gpt-5.6-luna',
        name: '客服 Agent',
        prompt: '只依据公开产品资料回答，不确定时说明限制。',
        tools: ['search_public_docs'],
        version: '1.0.0',
      },
      slug: 'public-support-agent',
      tags: ['support', 'faq'],
      title: '公开客服 Agent',
      type: 'AGENT',
      version: '1.0.0',
    });

    expect(result.success).toBe(true);
  });

  it('接受新的版本快照与变更说明', () => {
    const result = marketplaceItemVersionRequestSchema.safeParse({
      changelog: '补充了公开资料不足时的兜底说明。',
      manifest: { version: '1.1.0' },
      version: '1.1.0',
    });

    expect(result.success).toBe(true);
  });
});
