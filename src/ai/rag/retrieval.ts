export type WorkspaceChunkCandidate = Readonly<{
  readonly chunkIndex?: number;
  readonly content: string;
  readonly documentId: string;
  readonly documentTitle: string;
  readonly organizationId: string;
  readonly workspaceId: string;
}>;

export type RankedWorkspaceChunk = WorkspaceChunkCandidate &
  Readonly<{
    readonly score: number;
  }>;

type RankWorkspaceChunksInput = Readonly<{
  readonly candidates: readonly WorkspaceChunkCandidate[];
  readonly organizationId: string;
  readonly query: string;
  readonly topK: number;
  readonly workspaceId: string;
}>;

export function rankWorkspaceChunks(
  input: RankWorkspaceChunksInput,
): readonly RankedWorkspaceChunk[] {
  const queryTerms = createSearchTerms(input.query);
  const safeTopK = Math.max(1, Math.trunc(input.topK));

  return input.candidates
    .filter(
      (candidate) =>
        candidate.organizationId === input.organizationId &&
        candidate.workspaceId === input.workspaceId,
    )
    .map((candidate) => ({
      ...candidate,
      score: calculateChunkScore(candidate.content, queryTerms),
    }))
    .filter((candidate) => candidate.score > 0)
    .sort(
      (left, right) => right.score - left.score || left.documentId.localeCompare(right.documentId),
    )
    .slice(0, safeTopK);
}

export function createSearchTerms(value: string): readonly string[] {
  const normalized = value.toLocaleLowerCase('zh-CN').trim();
  const characters = Array.from(normalized).filter((character) => /[\p{L}\p{N}]/u.test(character));

  return [...new Set(characters)];
}

function calculateChunkScore(content: string, queryTerms: readonly string[]): number {
  const normalized = content.toLocaleLowerCase('zh-CN');

  return queryTerms.reduce((score, term) => score + (normalized.includes(term) ? 1 : 0), 0);
}
