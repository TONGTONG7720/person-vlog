export const proposalTemplateIds = [
  'enterprise-system',
  'ai-product',
  'automation',
  'website',
] as const;

export type ProposalTemplateId = (typeof proposalTemplateIds)[number];

export function getProposalTemplateId(service: string): ProposalTemplateId {
  const normalizedService = service.toLocaleLowerCase('zh-CN');

  if (normalizedService.includes('ai') || normalizedService.includes('知识库')) {
    return 'ai-product';
  }

  if (normalizedService.includes('自动化') || normalizedService.includes('python')) {
    return 'automation';
  }

  if (normalizedService.includes('网站') || normalizedService.includes('官网')) {
    return 'website';
  }

  return 'enterprise-system';
}
