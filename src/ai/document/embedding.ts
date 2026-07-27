export type AiEmbeddingConfiguration =
  | Readonly<{ readonly kind: 'available'; readonly model: string }>
  | Readonly<{ readonly kind: 'disabled' }>;

export function getAiEmbeddingConfiguration(): AiEmbeddingConfiguration {
  const model = process.env['AI_EMBEDDING_MODEL']?.trim();
  const apiKey = process.env['AI_EMBEDDING_API_KEY']?.trim();

  return model === undefined || model === '' || apiKey === undefined || apiKey === ''
    ? { kind: 'disabled' }
    : { kind: 'available', model };
}
