import { describe, expect, it } from 'vitest';

import {
  adminLoginSchema,
  parseAdminKnowledgeForm,
  parseAdminPostForm,
  parseAdminProjectForm,
} from '../src/server/cms/validation';

function createProjectFormData(): FormData {
  const formData = new FormData();

  formData.set('title', '  企业运营系统  ');
  formData.set('slug', 'operations-system');
  formData.set('description', '用于整理订单、库存与协作流程的管理系统。');
  formData.set('category', 'enterprise-system, java');
  formData.set('technologies', 'Java, Spring Boot, Vue 3');
  formData.set('status', 'in-progress');
  formData.set('featured', 'on');
  formData.set('locale', 'zh-CN');

  return formData;
}

describe('CMS 管理输入边界', () => {
  it('拒绝格式错误的管理员登录信息', () => {
    const result = adminLoginSchema.safeParse({
      email: 'not-an-email',
      password: 'short',
    });

    expect(result.success).toBe(false);
  });

  it('规范化项目表单中的文本与逗号分隔列表', () => {
    const result = parseAdminProjectForm(createProjectFormData());

    expect(result).toEqual({
      kind: 'accepted',
      value: {
        categories: ['enterprise-system', 'java'],
        content: '',
        coverImage: '',
        description: '用于整理订单、库存与协作流程的管理系统。',
        featured: true,
        locale: 'zh-CN',
        slug: 'operations-system',
        status: 'in-progress',
        technologies: ['Java', 'Spring Boot', 'Vue 3'],
        title: '企业运营系统',
        translationGroup: '',
      },
    });
  });

  it('将 Markdown 文章表单解析为可发布内容', () => {
    const formData = new FormData();
    formData.set('title', 'RAG 系统的检索边界');
    formData.set('slug', 'rag-retrieval-boundaries');
    formData.set('description', '说明检索增强生成系统中资料、检索和人工验证之间的边界。');
    formData.set('content', '## 资料与检索\n\n先确认资料质量，再讨论模型能力。');
    formData.set('category', 'ai');
    formData.set('tags', 'AI, RAG, Architecture');
    formData.set('keywords', 'RAG 企业知识库, 向量检索');
    formData.set('seoTitle', '企业 RAG 知识库的检索边界');
    formData.set(
      'seoDescription',
      '围绕资料治理、检索链路和人工校验，说明企业 RAG 系统的关键边界。',
    );
    formData.set('relatedProjects', 'enterprise-rag-knowledge-base');
    formData.set('relatedServices', 'ai-application-development');
    formData.set('published', 'on');
    formData.set('locale', 'zh-CN');

    expect(parseAdminPostForm(formData)).toMatchObject({
      kind: 'accepted',
      value: {
        category: 'ai',
        keywords: ['RAG 企业知识库', '向量检索'],
        locale: 'zh-CN',
        published: true,
        relatedProjects: ['enterprise-rag-knowledge-base'],
        relatedServices: ['ai-application-development'],
        seoDescription: '围绕资料治理、检索链路和人工校验，说明企业 RAG 系统的关键边界。',
        seoTitle: '企业 RAG 知识库的检索边界',
        slug: 'rag-retrieval-boundaries',
        tags: ['AI', 'RAG', 'Architecture'],
      },
    });
  });

  it('拒绝未填写正文的 AI 知识条目', () => {
    const formData = new FormData();
    formData.set('title', '服务范围');
    formData.set('slug', 'services');
    formData.set('category', 'services');
    formData.set('content', '');

    expect(parseAdminKnowledgeForm(formData).kind).toBe('invalid');
  });
});
