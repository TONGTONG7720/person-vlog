import { describe, expect, it } from 'vitest';

import { POST } from '../src/app/api/contact/route';
import { contactFormSchema, parseContactSubmission } from '../src/lib/validations/contact';

const validSubmission = {
  budget: '',
  company: '',
  email: 'hello@example.com',
  formOpenedAt: 1_000,
  message: '我想讨论一个帮助团队管理项目流程的 AI 应用。',
  name: '瞳瞳',
  service: 'ai',
  timeline: 'soon',
  website: '',
} as const;

describe('contact submission boundary', () => {
  it('accepts a normal inquiry after the minimum completion time', () => {
    const result = parseContactSubmission(validSubmission, 3_000);

    expect(result).toEqual({
      data: {
        email: 'hello@example.com',
        message: '我想讨论一个帮助团队管理项目流程的 AI 应用。',
        name: '瞳瞳',
        service: 'ai',
        timeline: 'soon',
      },
      kind: 'accepted',
    });
  });

  it('keeps a recognised acquisition source for CRM lead creation', () => {
    const result = parseContactSubmission(
      {
        ...validSubmission,
        source: 'xiaohongshu',
      },
      3_000,
    );

    expect(result).toEqual({
      data: {
        email: 'hello@example.com',
        message: '我想讨论一个帮助团队管理项目流程的 AI 应用。',
        name: '瞳瞳',
        service: 'ai',
        source: 'xiaohongshu',
        timeline: 'soon',
      },
      kind: 'accepted',
    });
  });

  it('rejects an invalid contact email before accepting a request', () => {
    const result = contactFormSchema.safeParse({
      ...validSubmission,
      email: 'not-an-email',
    });

    expect(result.success).toBe(false);
  });

  it('rejects a honeypot response without exposing a validation detail', () => {
    const result = parseContactSubmission(
      {
        ...validSubmission,
        website: 'https://spam.example',
      },
      3_000,
    );

    expect(result).toEqual({ kind: 'spam' });
  });

  it('rejects a submission that arrives too quickly to be human input', () => {
    const result = parseContactSubmission(validSubmission, 1_500);

    expect(result).toEqual({ kind: 'spam' });
  });

  it('rejects a declared request body that exceeds the contact API limit', async () => {
    const request = new Request('http://localhost:3000/api/contact', {
      body: JSON.stringify({
        ...validSubmission,
        formOpenedAt: Date.now() - 2_000,
      }),
      headers: {
        'content-length': '12001',
        'content-type': 'application/json',
      },
      method: 'POST',
    });

    const response = await POST(request);

    expect(response.status).toBe(413);
  });
});
