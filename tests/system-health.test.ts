import { describe, expect, it } from 'vitest';

import { createSystemHealthSnapshot } from '../src/server/observability/health';

const checkedAt = new Date('2026-07-26T00:00:00.000Z');

describe('system health aggregation', () => {
  it('keeps the public site healthy when optional services are not configured', () => {
    const snapshot = createSystemHealthSnapshot({
      checkedAt,
      services: {
        ai: { status: 'not-configured' },
        database: { status: 'not-configured' },
        email: { status: 'not-configured' },
        monitoring: { status: 'not-configured' },
        website: { status: 'healthy' },
      },
    });

    expect(snapshot.status).toBe('ok');
    expect(snapshot.services.database.status).toBe('not-configured');
    expect(snapshot.checkedAt).toBe('2026-07-26T00:00:00.000Z');
  });

  it('marks the health endpoint as degraded when a configured critical service fails', () => {
    const snapshot = createSystemHealthSnapshot({
      checkedAt,
      services: {
        ai: { status: 'healthy' },
        database: { status: 'error' },
        email: { status: 'healthy' },
        monitoring: { status: 'healthy' },
        website: { status: 'healthy' },
      },
    });

    expect(snapshot.status).toBe('degraded');
    expect(snapshot.services.database.status).toBe('error');
  });
});
