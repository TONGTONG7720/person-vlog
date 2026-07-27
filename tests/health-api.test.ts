import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { GET } from '../src/app/api/health/route';

const originalDatabaseUrl = process.env['DATABASE_URL'];

beforeEach(() => {
  delete process.env['DATABASE_URL'];
});

afterEach(() => {
  if (originalDatabaseUrl === undefined) {
    delete process.env['DATABASE_URL'];

    return;
  }

  process.env['DATABASE_URL'] = originalDatabaseUrl;
});

describe('health endpoint', () => {
  it('returns an uncached ok response when the optional CMS database is not configured', async () => {
    const response = await GET();
    const payload: unknown = await response.json();

    expect(response.status).toBe(200);
    expect(response.headers.get('Cache-Control')).toBe('no-store, max-age=0');
    expect(payload).toMatchObject({
      services: { database: { status: 'not-configured' } },
      status: 'ok',
    });
  });
});
