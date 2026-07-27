import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { POST } from '../src/app/api/analytics/route';
import { analyticsRequestSchema } from '../src/lib/analytics-contract';
import { readUtmAttribution } from '../src/lib/utm';

const originalDatabaseUrl = process.env['DATABASE_URL'];
const analyticsSessionId = '820b63ed-7e21-4e3c-9482-9e11b8543f50';

function createAnalyticsRequest(payload: unknown): Request {
  return new Request('http://localhost:3000/api/analytics', {
    body: JSON.stringify(payload),
    headers: { 'content-type': 'application/json' },
    method: 'POST',
  });
}

beforeEach(() => {
  delete process.env['DATABASE_URL'];
});

afterEach(() => {
  if (originalDatabaseUrl === undefined) {
    delete process.env['DATABASE_URL'];
  } else {
    process.env['DATABASE_URL'] = originalDatabaseUrl;
  }
});

describe('privacy-safe analytics event boundary', () => {
  it('accepts an allowed contact conversion event', () => {
    const result = analyticsRequestSchema.safeParse({
      event: 'click_contact',
      metadata: { language: 'zh-CN', source: 'hero' },
      path: '/',
      sessionId: analyticsSessionId,
    });

    expect(result.success).toBe(true);
  });

  it('accepts English page events while restricting language values', () => {
    const valid = analyticsRequestSchema.safeParse({
      event: 'page_view',
      metadata: { language: 'en-US' },
      path: '/en',
      sessionId: analyticsSessionId,
    });
    const invalid = analyticsRequestSchema.safeParse({
      event: 'page_view',
      metadata: { language: 'fr-FR' },
      path: '/',
      sessionId: analyticsSessionId,
    });

    expect(valid.success).toBe(true);
    expect(invalid.success).toBe(false);
  });

  it('records whether a visit came from the installed app or a browser tab', () => {
    const standaloneVisit = analyticsRequestSchema.safeParse({
      event: 'page_view',
      metadata: { accessMode: 'pwa', language: 'zh-CN' },
      path: '/',
      sessionId: analyticsSessionId,
    });
    const invalidVisit = analyticsRequestSchema.safeParse({
      event: 'page_view',
      metadata: { accessMode: 'native-app', language: 'zh-CN' },
      path: '/',
      sessionId: analyticsSessionId,
    });

    expect(standaloneVisit.success).toBe(true);
    expect(invalidVisit.success).toBe(false);
  });

  it('accepts a content conversion without storing visitor text', () => {
    const result = analyticsRequestSchema.safeParse({
      event: 'content_conversion',
      metadata: {
        slug: 'rag-knowledge-system',
        target: 'service',
        targetId: 'ai-application-development',
      },
      path: '/blog/rag-knowledge-system',
      sessionId: analyticsSessionId,
    });

    expect(result.success).toBe(true);
  });

  it('rejects AI question content and other unapproved metadata', () => {
    const result = analyticsRequestSchema.safeParse({
      event: 'use_ai_assistant',
      metadata: {
        category: 'project',
        content: '请保存我的内部资料和报价。',
      },
      path: '/',
      sessionId: analyticsSessionId,
    });

    expect(result.success).toBe(false);
  });

  it('rejects unknown top-level input instead of accepting arbitrary client data', () => {
    const result = analyticsRequestSchema.safeParse({
      event: 'page_view',
      metadata: {},
      path: '/',
      prompt: 'do not store this',
      sessionId: analyticsSessionId,
    });

    expect(result.success).toBe(false);
  });

  it('normalizes only permitted first-touch UTM values', () => {
    expect(
      readUtmAttribution(
        new URLSearchParams(
          'utm_source=xiaohongshu&utm_medium=social&utm_campaign=summer_launch&utm_term=ignore',
        ),
      ),
    ).toEqual({
      firstCampaign: 'summer_launch',
      firstMedium: 'social',
      firstSource: 'xiaohongshu',
    });
  });

  it('returns no content for a valid event when analytics storage is not configured', async () => {
    const response = await POST(
      createAnalyticsRequest({
        event: 'view_project',
        metadata: { project: 'enterprise-rag-knowledge-base' },
        path: '/projects/enterprise-rag-knowledge-base',
        sessionId: analyticsSessionId,
      }),
    );

    expect(response.status).toBe(204);
  });

  it('returns a validation error before an invalid event can be stored', async () => {
    const response = await POST(
      createAnalyticsRequest({
        event: 'use_ai_assistant',
        metadata: { category: 'project', question: 'private question' },
        path: '/',
        sessionId: analyticsSessionId,
      }),
    );

    expect(response.status).toBe(400);
  });
});
