import { NextResponse } from 'next/server';

import { contactCopy } from '@/config/contact';
import { logger } from '@/lib/logger';
import { parseContactSubmission } from '@/lib/validations/contact';
import { getCmsDatabase } from '@/server/cms/database';
import { createCrmLeadFromContact } from '@/server/crm/contact-lead';
import type { ContactApiResponse } from '@/types/contact';

const maximumContactPayloadBytes = 12_000;

type ContactPayloadReadResult =
  | Readonly<{
      readonly kind: 'invalid';
    }>
  | Readonly<{
      readonly kind: 'too-large';
    }>
  | Readonly<{
      readonly kind: 'parsed';
      readonly payload: unknown;
    }>;

function createRejectedResponse(status: number): NextResponse<ContactApiResponse> {
  return NextResponse.json({ kind: 'rejected', message: contactCopy.failure }, { status });
}

async function readContactPayload(request: Request): Promise<ContactPayloadReadResult> {
  const contentLength = request.headers.get('content-length');
  const declaredByteLength = contentLength === null ? undefined : Number(contentLength);

  if (
    declaredByteLength !== undefined &&
    Number.isFinite(declaredByteLength) &&
    declaredByteLength > maximumContactPayloadBytes
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

      if (receivedByteLength > maximumContactPayloadBytes) {
        await reader.cancel();

        return { kind: 'too-large' };
      }

      body += decoder.decode(chunk.value, { stream: true });
    }

    body += decoder.decode();
    const payload: unknown = JSON.parse(body);

    return { kind: 'parsed', payload };
  } catch (error) {
    if (error instanceof SyntaxError || error instanceof TypeError) {
      return { kind: 'invalid' };
    }

    throw error;
  } finally {
    reader.releaseLock();
  }
}

export function GET(): NextResponse<ContactApiResponse> {
  return NextResponse.json(
    { kind: 'rejected', message: contactCopy.failure },
    { headers: { Allow: 'POST' }, status: 405 },
  );
}

export async function POST(request: Request): Promise<NextResponse<ContactApiResponse>> {
  const contentType = request.headers.get('content-type');

  if (contentType === null || !contentType.includes('application/json')) {
    return createRejectedResponse(415);
  }

  let payloadResult: ContactPayloadReadResult;

  try {
    payloadResult = await readContactPayload(request);
  } catch (error) {
    if (error instanceof Error) {
      return createRejectedResponse(500);
    }

    throw error;
  }

  switch (payloadResult.kind) {
    case 'invalid':
      return createRejectedResponse(400);
    case 'too-large':
      return createRejectedResponse(413);
    case 'parsed': {
      const submission = parseContactSubmission(payloadResult.payload);

      switch (submission.kind) {
        case 'accepted': {
          const database = getCmsDatabase();

          if (database !== undefined) {
            const startedAt = Date.now();

            try {
              await createCrmLeadFromContact(database, submission.data);

              logger.info('api.contact.persistence_completed', {
                durationMs: Date.now() - startedAt,
                route: '/api/contact',
              });
            } catch (error) {
              logger.error('api.contact.persistence_failed', error, {
                durationMs: Date.now() - startedAt,
                route: '/api/contact',
              });

              return createRejectedResponse(503);
            }
          }

          return NextResponse.json({ kind: 'accepted', message: contactCopy.success });
        }
        case 'invalid':
        case 'spam':
          return createRejectedResponse(400);
      }
    }
  }
}
