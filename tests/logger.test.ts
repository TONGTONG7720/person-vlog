import { describe, expect, it } from 'vitest';

import { createLogRecord } from '../src/lib/logger';

describe('production logger', () => {
  it('redacts secret-like context keys before writing a record', () => {
    const record = createLogRecord({
      context: {
        apiKey: 'secret-value',
        requestId: 'request-123',
        token: 'token-value',
      },
      event: 'api.assistant.model_failure',
      level: 'error',
      timestamp: new Date('2026-07-26T00:00:00.000Z'),
    });

    expect(record).toEqual({
      context: {
        apiKey: '[REDACTED]',
        requestId: 'request-123',
        token: '[REDACTED]',
      },
      event: 'api.assistant.model_failure',
      level: 'error',
      timestamp: '2026-07-26T00:00:00.000Z',
    });
  });
});
