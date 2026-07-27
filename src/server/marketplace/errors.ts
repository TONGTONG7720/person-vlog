export class MarketplaceInputError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = 'MarketplaceInputError';
  }
}

export class MarketplaceStateError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = 'MarketplaceStateError';
  }
}

export class MarketplaceRateLimitError extends Error {
  public constructor() {
    super('Marketplace API request limit reached.');
    this.name = 'MarketplaceRateLimitError';
  }
}
