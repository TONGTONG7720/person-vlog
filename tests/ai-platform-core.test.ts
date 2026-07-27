import { describe, expect, it } from 'vitest';

import { chunkDocumentText } from '../src/ai/document/chunker';
import { rankWorkspaceChunks } from '../src/ai/rag/retrieval';
import { createAiApiKey, hashAiApiKey, verifyAiApiKey } from '../src/server/saas/ai-api-keys';

describe('AI SaaS 平台核心边界', () => {
  it('按可配置大小和重叠量切分知识文档', () => {
    // Given
    const content = '第一段说明企业资料治理。第二段说明访问控制。第三段说明知识检索。';

    // When
    const chunks = chunkDocumentText({ chunkOverlap: 4, chunkSize: 14, content });

    // Then
    expect(chunks).toHaveLength(4);
    expect(chunks[0]).toMatchObject({ index: 0, content: '第一段说明企业资料治理。第二' });
    expect(chunks[1]?.content.startsWith('理。')).toBe(true);
    expect(chunks.every((chunk) => chunk.estimatedTokens > 0)).toBe(true);
  });

  it('只从当前组织和 AI Workspace 的分片中检索来源', () => {
    // Given
    const candidates = [
      {
        content: '员工手册规定销售团队可以访问产品价格资料。',
        documentId: 'document-a',
        documentTitle: '员工手册.md',
        organizationId: 'organization-a',
        workspaceId: 'workspace-a',
      },
      {
        content: '员工手册规定销售团队可以访问产品价格资料。',
        documentId: 'document-b',
        documentTitle: '其他企业资料.md',
        organizationId: 'organization-b',
        workspaceId: 'workspace-b',
      },
    ] as const;

    // When
    const result = rankWorkspaceChunks({
      candidates,
      organizationId: 'organization-a',
      query: '销售团队可以访问哪些价格资料？',
      topK: 3,
      workspaceId: 'workspace-a',
    });

    // Then
    expect(result).toEqual([
      expect.objectContaining({ documentId: 'document-a', organizationId: 'organization-a' }),
    ]);
  });

  it('只返回一次明文 API Key，并始终通过哈希验证', () => {
    // Given
    const key = createAiApiKey();

    // When
    const keyHash = hashAiApiKey(key.secret);

    // Then
    expect(key.secret.startsWith('tai_')).toBe(true);
    expect(keyHash).not.toContain(key.secret);
    expect(verifyAiApiKey(key.secret, keyHash)).toBe(true);
    expect(verifyAiApiKey(`${key.secret}x`, keyHash)).toBe(false);
  });
});
