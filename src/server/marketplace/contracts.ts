export const marketplaceItemStatuses = [
  'DRAFT',
  'REVIEW',
  'PUBLISHED',
  'REJECTED',
  'ARCHIVED',
] as const;

export type MarketplaceItemStatus = (typeof marketplaceItemStatuses)[number];

export type MarketplaceVisibilityCandidate = Readonly<{
  readonly enabled: boolean;
  readonly publishedAt: Date | null;
  readonly status: MarketplaceItemStatus;
}>;

const marketplaceStatusTransitions = {
  ARCHIVED: ['DRAFT'],
  DRAFT: ['REVIEW', 'ARCHIVED'],
  PUBLISHED: ['ARCHIVED', 'REVIEW'],
  REJECTED: ['DRAFT', 'ARCHIVED'],
  REVIEW: ['PUBLISHED', 'REJECTED', 'DRAFT', 'ARCHIVED'],
} as const satisfies Readonly<Record<MarketplaceItemStatus, readonly MarketplaceItemStatus[]>>;

export function canTransitionMarketplaceStatus(
  input: Readonly<{ readonly from: MarketplaceItemStatus; readonly to: MarketplaceItemStatus }>,
): boolean {
  return marketplaceStatusTransitions[input.from].some((status) => status === input.to);
}

export function isPublicMarketplaceItem(input: MarketplaceVisibilityCandidate): boolean {
  return input.enabled && input.status === 'PUBLISHED' && input.publishedAt !== null;
}
