import { NextResponse } from 'next/server';

import {
  createKnowledgeFallbackReply,
  createModelFailureReply,
  createRestrictedReply,
} from '@/ai/fallback';
import { getKnowledgeLinks, retrieveKnowledge } from '@/ai/knowledge/retrieval';
import {
  getLatestUserQuestion,
  assistantRequestSchema,
  isSafeAssistantQuestion,
} from '@/ai/lib/validation';
import { getAssistantModelConfiguration } from '@/ai/model-config';
import { AssistantModelError, streamAssistantModel } from '@/ai/model-stream';
import { buildAssistantSystemPrompt, toModelMessages } from '@/ai/prompts/system';
import { consumeAssistantRateLimit } from '@/ai/rate-limit';
import { createTextStream, encodeTextStream } from '@/ai/stream';
import { logger } from '@/lib/logger';
import type { AssistantLink } from '@/types/chat';

export const runtime = 'nodejs';

const maximumAssistantPayloadBytes = 32_000;
const maximumAssistantResponseTokens = 420;
const assistantGenericFailureMessage = '暂时无法回答。你也可以直接通过联系页面沟通。';

type AssistantPayloadReadResult =
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

function createAssistantErrorResponse(status: number, retryAfterSeconds?: number): NextResponse {
  const headers =
    retryAfterSeconds === undefined ? {} : { 'Retry-After': String(retryAfterSeconds) };

  return NextResponse.json({ message: assistantGenericFailureMessage }, { headers, status });
}

function createAssistantStreamResponse(
  source: ReadableStream<string>,
  links: readonly AssistantLink[],
): Response {
  return new Response(encodeTextStream(source), {
    headers: {
      'Cache-Control': 'no-store, max-age=0',
      'Content-Type': 'text/plain; charset=utf-8',
      'X-Assistant-Links': encodeURIComponent(JSON.stringify(links)),
      'X-Content-Type-Options': 'nosniff',
    },
  });
}

async function readAssistantPayload(request: Request): Promise<AssistantPayloadReadResult> {
  const declaredContentLength = request.headers.get('content-length');
  const declaredByteLength =
    declaredContentLength === null ? undefined : Number(declaredContentLength);

  if (
    declaredByteLength !== undefined &&
    Number.isFinite(declaredByteLength) &&
    declaredByteLength > maximumAssistantPayloadBytes
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
      const nextChunk = await reader.read();

      if (nextChunk.done) {
        break;
      }

      receivedByteLength += nextChunk.value.byteLength;

      if (receivedByteLength > maximumAssistantPayloadBytes) {
        await reader.cancel();

        return { kind: 'too-large' };
      }

      body += decoder.decode(nextChunk.value, { stream: true });
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
  return NextResponse.json(
    { message: assistantGenericFailureMessage },
    { headers: { Allow: 'POST' }, status: 405 },
  );
}

export async function POST(request: Request): Promise<Response> {
  if (!request.headers.get('content-type')?.includes('application/json')) {
    return createAssistantErrorResponse(415);
  }

  const rateLimitResult = consumeAssistantRateLimit(request);

  if (!rateLimitResult.allowed) {
    return createAssistantErrorResponse(429, rateLimitResult.retryAfterSeconds);
  }

  let payloadResult: AssistantPayloadReadResult;

  try {
    payloadResult = await readAssistantPayload(request);
  } catch (error) {
    if (error instanceof Error) {
      return createAssistantErrorResponse(500);
    }

    throw error;
  }

  if (payloadResult.kind === 'invalid') {
    return createAssistantErrorResponse(400);
  }

  if (payloadResult.kind === 'too-large') {
    return createAssistantErrorResponse(413);
  }

  const parsedRequest = assistantRequestSchema.safeParse(payloadResult.payload);

  if (!parsedRequest.success) {
    return createAssistantErrorResponse(400);
  }

  const latestQuestion = getLatestUserQuestion(parsedRequest.data.messages);
  const locale = parsedRequest.data.locale;

  if (latestQuestion === undefined) {
    return createAssistantErrorResponse(400);
  }

  if (!isSafeAssistantQuestion(latestQuestion)) {
    const reply = createRestrictedReply(locale);

    return createAssistantStreamResponse(createTextStream(reply.content), reply.links);
  }

  const knowledge = await retrieveKnowledge(latestQuestion);
  const modelConfiguration = getAssistantModelConfiguration();

  if (modelConfiguration.kind === 'disabled') {
    const reply = createKnowledgeFallbackReply(latestQuestion, knowledge, locale);

    return createAssistantStreamResponse(createTextStream(reply.content), reply.links);
  }

  const startedAt = Date.now();

  try {
    const modelStream = await streamAssistantModel(modelConfiguration, {
      maxTokens: maximumAssistantResponseTokens,
      messages: toModelMessages(parsedRequest.data.messages),
      systemPrompt: buildAssistantSystemPrompt(knowledge, locale),
    });

    logger.info('api.assistant.model_stream_opened', {
      durationMs: Date.now() - startedAt,
      provider: modelConfiguration.provider,
      route: '/api/assistant',
    });

    return createAssistantStreamResponse(modelStream, getKnowledgeLinks(knowledge, locale));
  } catch (error) {
    if (
      error instanceof AssistantModelError ||
      error instanceof DOMException ||
      error instanceof TypeError
    ) {
      logger.warn('api.assistant.model_unavailable', {
        durationMs: Date.now() - startedAt,
        errorName: error.name,
        provider: modelConfiguration.provider,
        route: '/api/assistant',
      });

      const reply = createModelFailureReply(locale);

      return createAssistantStreamResponse(createTextStream(reply.content), reply.links);
    }

    throw error;
  }
}
