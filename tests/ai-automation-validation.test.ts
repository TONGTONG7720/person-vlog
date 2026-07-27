import { describe, expect, it } from 'vitest';

import {
  parseAiContentWorkflowForm,
  parseAiContentDraftReviewForm,
  parseAiMeetingWorkflowForm,
  parseAiModelConfigForm,
} from '../src/server/ai/validation';

describe('AI 自动化后台输入边界', () => {
  it('解析待审核内容主题与可选线索会议记录', () => {
    const contentForm = new FormData();
    contentForm.set('topic', '企业 RAG 知识库的资料治理');
    const meetingForm = new FormData();
    meetingForm.set('leadId', 'lead-123');
    meetingForm.set('content', '客户希望先梳理资料来源、权限角色和试点范围。');

    expect(parseAiContentWorkflowForm(contentForm)).toEqual({
      kind: 'accepted',
      value: { topic: '企业 RAG 知识库的资料治理' },
    });
    expect(parseAiMeetingWorkflowForm(meetingForm)).toEqual({
      kind: 'accepted',
      value: {
        content: '客户希望先梳理资料来源、权限角色和试点范围。',
        leadId: 'lead-123',
      },
    });
  });

  it('只接受受支持模型配置与合理的 Token 预算', () => {
    const validForm = new FormData();
    validForm.set('provider', 'local');
    validForm.set('model', 'gpt-5.6-luna');
    validForm.set('priority', '10');
    validForm.set('maxTokens', '1200');
    validForm.set('dailyLimit', '50000');
    validForm.set('monthlyLimit', '500000');

    const invalidForm = new FormData();
    invalidForm.set('provider', 'unknown');
    invalidForm.set('model', 'x');
    invalidForm.set('maxTokens', '10');

    expect(parseAiModelConfigForm(validForm)).toEqual({
      kind: 'accepted',
      value: {
        dailyLimit: 50_000,
        maxTokens: 1_200,
        model: 'gpt-5.6-luna',
        monthlyLimit: 500_000,
        priority: 10,
        provider: 'local',
      },
    });
    expect(parseAiModelConfigForm(invalidForm).kind).toBe('invalid');
  });

  it('仅接受明确选择的 AI 内容草稿以进入博客编辑流', () => {
    const validForm = new FormData();
    validForm.set('id', 'ai-draft-123');

    expect(parseAiContentDraftReviewForm(validForm)).toEqual({
      kind: 'accepted',
      value: { id: 'ai-draft-123' },
    });
    expect(parseAiContentDraftReviewForm(new FormData()).kind).toBe('invalid');
  });
});
