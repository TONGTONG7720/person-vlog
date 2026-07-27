export function createTaskKnowledgeEntityName(request: string): string {
  const normalized = request.replaceAll(/\s+/g, ' ').trim();

  return normalized.length <= 96 ? normalized : `${normalized.slice(0, 95)}…`;
}
