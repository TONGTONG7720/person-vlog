import { z } from 'zod';

import type { AssistantModelConfiguration } from '@/ai/model-config';

const assistantModelTimeoutMilliseconds = 20_000;
const openAiStreamChunkSchema = z.object({
  choices: z.array(z.object({ delta: z.object({ content: z.string().optional() }).optional() })),
});
const anthropicStreamChunkSchema = z.object({
  delta: z.object({ text: z.string().optional() }).optional(),
  type: z.string(),
});
const geminiStreamChunkSchema = z.object({
  candidates: z
    .array(
      z.object({
        content: z
          .object({ parts: z.array(z.object({ text: z.string().optional() })).optional() })
          .optional(),
      }),
    )
    .optional(),
});

export type AssistantModelMessage = Readonly<{
  readonly content: string;
  readonly role: 'assistant' | 'user';
}>;

export type AssistantModelRequest = Readonly<{
  readonly maxTokens: number;
  readonly messages: readonly AssistantModelMessage[];
  readonly systemPrompt: string;
  readonly temperature?: number;
}>;

type SseTokenParser = (payload: string) => string | undefined;

export class AssistantModelError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = 'AssistantModelError';
  }
}

function createSseTextStream(
  response: Response,
  parseToken: SseTokenParser,
): ReadableStream<string> {
  const body = response.body;

  if (body === null) {
    throw new AssistantModelError('Model response did not include a stream.');
  }

  return new ReadableStream<string>({
    async start(controller) {
      const decoder = new TextDecoder();
      const reader = body.getReader();
      let buffer = '';

      try {
        while (true) {
          const nextChunk = await reader.read();

          if (nextChunk.done) {
            break;
          }

          buffer += decoder.decode(nextChunk.value, { stream: true });
          const events = buffer.split(/\r?\n\r?\n/gu);
          buffer = events.pop() ?? '';

          for (const event of events) {
            const data = event
              .split(/\r?\n/gu)
              .filter((line) => line.startsWith('data:'))
              .map((line) => line.slice('data:'.length).trim())
              .join('\n');

            if (data === '' || data === '[DONE]') {
              continue;
            }

            const token = parseToken(data);

            if (token !== undefined && token !== '') {
              controller.enqueue(token);
            }
          }
        }

        const remainingData = buffer
          .split(/\r?\n/gu)
          .filter((line) => line.startsWith('data:'))
          .map((line) => line.slice('data:'.length).trim())
          .join('\n');
        const remainingToken = remainingData === '' ? undefined : parseToken(remainingData);

        if (remainingToken !== undefined && remainingToken !== '') {
          controller.enqueue(remainingToken);
        }

        controller.close();
      } catch (error) {
        if (error instanceof AssistantModelError || error instanceof TypeError) {
          controller.error(error);

          return;
        }

        controller.error(new AssistantModelError('Model stream could not be read.'));
      } finally {
        reader.releaseLock();
      }
    },
  });
}

function parseOpenAiToken(payload: string): string | undefined {
  try {
    const parsed = openAiStreamChunkSchema.safeParse(JSON.parse(payload));

    return parsed.success ? parsed.data.choices[0]?.delta?.content : undefined;
  } catch (error) {
    if (error instanceof SyntaxError) {
      return undefined;
    }

    throw error;
  }
}

function parseAnthropicToken(payload: string): string | undefined {
  try {
    const parsed = anthropicStreamChunkSchema.safeParse(JSON.parse(payload));

    return parsed.success && parsed.data.type === 'content_block_delta'
      ? parsed.data.delta?.text
      : undefined;
  } catch (error) {
    if (error instanceof SyntaxError) {
      return undefined;
    }

    throw error;
  }
}

function parseGeminiToken(payload: string): string | undefined {
  try {
    const parsed = geminiStreamChunkSchema.safeParse(JSON.parse(payload));

    return parsed.success
      ? parsed.data.candidates?.[0]?.content?.parts?.map((part) => part.text ?? '').join('')
      : undefined;
  } catch (error) {
    if (error instanceof SyntaxError) {
      return undefined;
    }

    throw error;
  }
}

async function requestModel(
  endpoint: string,
  headers: Readonly<Record<string, string>>,
  body: string,
): Promise<Response> {
  try {
    const response = await fetch(endpoint, {
      body,
      headers,
      method: 'POST',
      signal: AbortSignal.timeout(assistantModelTimeoutMilliseconds),
    });

    if (!response.ok) {
      throw new AssistantModelError('Model request was rejected.');
    }

    return response;
  } catch (error) {
    if (error instanceof AssistantModelError) {
      throw error;
    }

    if (error instanceof DOMException || error instanceof TypeError) {
      throw new AssistantModelError('Model request failed.');
    }

    throw error;
  }
}

async function streamOpenAiCompatibleModel(
  configuration: Extract<AssistantModelConfiguration, { readonly kind: 'available' }>,
  request: AssistantModelRequest,
): Promise<ReadableStream<string>> {
  const authorizationHeaders =
    configuration.apiKey === '' ? {} : { Authorization: `Bearer ${configuration.apiKey}` };
  const response = await requestModel(
    configuration.endpoint,
    {
      Accept: 'text/event-stream',
      'Content-Type': 'application/json',
      ...authorizationHeaders,
    },
    JSON.stringify({
      max_tokens: request.maxTokens,
      messages: [{ content: request.systemPrompt, role: 'system' }, ...request.messages],
      model: configuration.model,
      stream: true,
      temperature: request.temperature ?? 0.2,
    }),
  );

  return createSseTextStream(response, parseOpenAiToken);
}

async function streamAnthropicModel(
  configuration: Extract<AssistantModelConfiguration, { readonly kind: 'available' }>,
  request: AssistantModelRequest,
): Promise<ReadableStream<string>> {
  const response = await requestModel(
    configuration.endpoint,
    {
      Accept: 'text/event-stream',
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01',
      'x-api-key': configuration.apiKey,
    },
    JSON.stringify({
      max_tokens: request.maxTokens,
      messages: request.messages,
      model: configuration.model,
      stream: true,
      system: request.systemPrompt,
      temperature: request.temperature ?? 0.2,
    }),
  );

  return createSseTextStream(response, parseAnthropicToken);
}

async function streamGeminiModel(
  configuration: Extract<AssistantModelConfiguration, { readonly kind: 'available' }>,
  request: AssistantModelRequest,
): Promise<ReadableStream<string>> {
  const response = await requestModel(
    configuration.endpoint,
    {
      Accept: 'text/event-stream',
      'Content-Type': 'application/json',
      'x-goog-api-key': configuration.apiKey,
    },
    JSON.stringify({
      contents: request.messages.map((message) => ({
        parts: [{ text: message.content }],
        role: message.role === 'assistant' ? 'model' : 'user',
      })),
      generationConfig: {
        maxOutputTokens: request.maxTokens,
        temperature: request.temperature ?? 0.2,
      },
      systemInstruction: { parts: [{ text: request.systemPrompt }] },
    }),
  );

  return createSseTextStream(response, parseGeminiToken);
}

export async function streamAssistantModel(
  configuration: Extract<AssistantModelConfiguration, { readonly kind: 'available' }>,
  request: AssistantModelRequest,
): Promise<ReadableStream<string>> {
  switch (configuration.provider) {
    case 'openai':
    case 'local':
      return streamOpenAiCompatibleModel(configuration, request);
    case 'anthropic':
      return streamAnthropicModel(configuration, request);
    case 'gemini':
      return streamGeminiModel(configuration, request);
  }
}
