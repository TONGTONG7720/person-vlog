export type DocumentTextChunk = Readonly<{
  readonly content: string;
  readonly estimatedTokens: number;
  readonly index: number;
}>;

type ChunkDocumentTextInput = Readonly<{
  readonly chunkOverlap: number;
  readonly chunkSize: number;
  readonly content: string;
}>;

const minimumChunkSize = 1;

export function estimateDocumentTokens(content: string): number {
  const normalized = content.trim();

  if (normalized === '') {
    return 0;
  }

  return Math.max(1, Math.ceil(Array.from(normalized).length / 2));
}

export function chunkDocumentText(input: ChunkDocumentTextInput): readonly DocumentTextChunk[] {
  const content = normalizeDocumentText(input.content);
  const chunkSize = Math.max(minimumChunkSize, Math.trunc(input.chunkSize));
  const chunkOverlap = Math.min(Math.max(0, Math.trunc(input.chunkOverlap)), chunkSize - 1);

  if (content === '') {
    return [];
  }

  const characters = Array.from(content);
  const step = chunkSize - chunkOverlap;
  const chunks: DocumentTextChunk[] = [];

  for (let start = 0; start < characters.length; start += step) {
    const chunk = characters
      .slice(start, start + chunkSize)
      .join('')
      .trim();

    if (chunk !== '') {
      chunks.push({
        content: chunk,
        estimatedTokens: estimateDocumentTokens(chunk),
        index: chunks.length,
      });
    }
  }

  return chunks;
}

function normalizeDocumentText(value: string): string {
  return value.replaceAll(/\s+/gu, ' ').trim();
}
