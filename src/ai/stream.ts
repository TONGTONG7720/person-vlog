const textEncoder = new TextEncoder();
const fallbackChunkLength = 36;

function splitTextIntoChunks(content: string): readonly string[] {
  const characters = Array.from(content);
  const chunks: string[] = [];

  for (let index = 0; index < characters.length; index += fallbackChunkLength) {
    chunks.push(characters.slice(index, index + fallbackChunkLength).join(''));
  }

  return chunks;
}

export function createTextStream(content: string): ReadableStream<string> {
  const chunks = splitTextIntoChunks(content);

  return new ReadableStream<string>({
    start(controller) {
      for (const chunk of chunks) {
        controller.enqueue(chunk);
      }

      controller.close();
    },
  });
}

export function encodeTextStream(source: ReadableStream<string>): ReadableStream<Uint8Array> {
  return source.pipeThrough(
    new TransformStream<string, Uint8Array>({
      transform(chunk, controller) {
        controller.enqueue(textEncoder.encode(chunk));
      },
    }),
  );
}
