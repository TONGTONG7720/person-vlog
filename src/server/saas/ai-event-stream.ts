import type { AiChatResult } from '@/server/saas/ai-chat';

const textEncoder = new TextEncoder();

export function createAiAppChatEventStream(result: AiChatResult): ReadableStream<Uint8Array> {
  return new ReadableStream<Uint8Array>({
    async start(controller) {
      const reader = result.stream.getReader();
      let answer = '';

      try {
        for (;;) {
          const next = await reader.read();

          if (next.done) {
            break;
          }

          answer += next.value;
          controller.enqueue(encodeEvent('token', { value: next.value }));
        }

        controller.enqueue(encodeEvent('sources', { sources: result.sources }));
        controller.enqueue(encodeEvent('done', { answer, sources: result.sources }));
        controller.close();
      } catch {
        controller.enqueue(encodeEvent('error', { message: 'AI 回复中断，请稍后重试。' }));
        controller.close();
      } finally {
        reader.releaseLock();
      }
    },
  });
}

function encodeEvent(event: string, payload: unknown): Uint8Array {
  return textEncoder.encode(`event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`);
}
