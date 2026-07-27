import { describe, expect, it } from 'vitest';

import { parseAdminContentPlanForm, parseAdminKeywordForm } from '../src/server/cms/validation';

describe('内容增长后台输入边界', () => {
  it('解析内容日历条目并保留排期状态', () => {
    const formData = new FormData();
    formData.set('title', 'Spring Boot 权限设计的边界');
    formData.set('keyword', 'Spring Boot 权限设计');
    formData.set('category', 'backend');
    formData.set('status', 'planning');
    formData.set('priority', 'high');
    formData.set('publishDate', '2026-08-01');
    formData.set('notes', '面向企业系统负责人，关联权限模块案例。');
    formData.set('locale', 'zh-CN');

    expect(parseAdminContentPlanForm(formData)).toEqual({
      kind: 'accepted',
      value: {
        category: 'backend',
        keyword: 'Spring Boot 权限设计',
        locale: 'zh-CN',
        notes: '面向企业系统负责人，关联权限模块案例。',
        priority: 'high',
        publishDate: new Date('2026-08-01T00:00:00.000Z'),
        status: 'planning',
        title: 'Spring Boot 权限设计的边界',
      },
    });
  });

  it('拒绝无效的关键词分类与空选题', () => {
    const formData = new FormData();
    formData.set('keyword', '');
    formData.set('category', 'marketing');

    expect(parseAdminKeywordForm(formData).kind).toBe('invalid');
  });

  it('解析关键词的分类、难度与搜索量', () => {
    const formData = new FormData();
    formData.set('keyword', '企业 RAG 知识库');
    formData.set('category', 'ai');
    formData.set('difficulty', '中');
    formData.set('volume', '1k - 5k / 月');

    expect(parseAdminKeywordForm(formData)).toEqual({
      kind: 'accepted',
      value: {
        category: 'ai',
        difficulty: '中',
        keyword: '企业 RAG 知识库',
        volume: '1k - 5k / 月',
      },
    });
  });
});
