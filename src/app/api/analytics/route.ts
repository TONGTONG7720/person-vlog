import { NextResponse } from 'next/server';

import { analyticsRequestSchema } from '@/lib/analytics-contract';
import { logger } from '@/lib/logger';
import { getCmsDatabase } from '@/server/cms/database';
import { consumeAnalyticsRateLimit } from '@/server/analytics/rate-limit';

const maximumAnalyticsPayloadBytes = 4_096;

type AnalyticsPayloadReadResult =
  | Readonly<{ readonly kind: 'invalid' }>
  | Readonly<{ readonly kind: 'too-large' }>
  | Readonly<{ readonly kind: 'parsed'; readonly payload: unknown }>;

function createAnalyticsErrorResponse(status: number, retryAfterSeconds?: number): NextResponse {
  return new NextResponse(null, {
    ...(retryAfterSeconds === undefined
      ? {}
      : { headers: { 'Retry-After': String(retryAfterSeconds) } }),
    status,
  });
}

async function readAnalyticsPayload(request: Request): Promise<AnalyticsPayloadReadResult> {
  const contentLength = request.headers.get('content-length');
  const declaredByteLength = contentLength === null ? undefined : Number(contentLength);

  if (
    declaredByteLength !== undefined &&
    Number.isFinite(declaredByteLength) &&
    declaredByteLength > maximumAnalyticsPayloadBytes
  ) {
    return { kind: 'too-large' };
  }

  const reader = request.body?.getReader();

  if (reader === undefined) {
    return { kind: 'invalid' };
  }

  const decoder = new TextDecoder();
  let body = '';
  let receivedByteLength = 0;

  try {
    while (true) {
      const chunk = await reader.read();

      if (chunk.done) {
        break;
      }

      receivedByteLength += chunk.value.byteLength;

      if (receivedByteLength > maximumAnalyticsPayloadBytes) {
        await reader.cancel();

        return { kind: 'too-large' };
      }

      body += decoder.decode(chunk.value, { stream: true });
    }

    body += decoder.decode();

    return { kind: 'parsed', payload: JSON.parse(body) };
  } catch (error) {
    if (error instanceof SyntaxError || error instanceof TypeError) {
      return { kind: 'invalid' };
    }

    throw error;
  } finally {
    reader.releaseLock();
  }
}

export function GET(): NextResponse {
  return new NextResponse(null, { headers: { Allow: 'POST' }, status: 405 });
}

export async function POST(request: Request): Promise<NextResponse> {
  const contentType = request.headers.get('content-type') ?? '';

  if (!contentType.includes('application/json') && !contentType.includes('text/plain')) {
    return createAnalyticsErrorResponse(415);
  }

  let payloadResult: AnalyticsPayloadReadResult;

  try {
    payloadResult = await readAnalyticsPayload(request);
  } catch (error) {
    if (error instanceof Error) {
      return createAnalyticsErrorResponse(500);
    }

    throw error;
  }

  if (payloadResult.kind === 'invalid') {
    return createAnalyticsErrorResponse(400);
  }

  if (payloadResult.kind === 'too-large') {
    return createAnalyticsErrorResponse(413);
  }

  const parsedPayload = analyticsRequestSchema.safeParse(payloadResult.payload);

  if (!parsedPayload.success) {
    return createAnalyticsErrorResponse(400);
  }

  const rateLimitResult = consumeAnalyticsRateLimit(parsedPayload.data.sessionId);

  if (!rateLimitResult.allowed) {
    return createAnalyticsErrorResponse(429, rateLimitResult.retryAfterSeconds);
  }

  const database = getCmsDatabase();

  if (database === undefined) {
    return new NextResponse(null, { status: 204 });
  }

  const startedAt = Date.now();

  try {
    await database.analyticsEvent.create({
      data: {
        event: parsedPayload.data.event,
        metadata: parsedPayload.data.metadata,
        path: parsedPayload.data.path,
      },
    });
    logger.info('api.analytics.persistence_completed', {
      durationMs: Date.now() - startedAt,
      route: '/api/analytics',
    });
  } catch (error) {
    logger.error('api.analytics.persistence_failed', error, {
      durationMs: Date.now() - startedAt,
      route: '/api/analytics',
    });

    return createAnalyticsErrorResponse(503);
  }

  return new NextResponse(null, { status: 204 });
}
