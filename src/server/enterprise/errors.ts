export class EnterpriseGatewayScopeError extends Error {
  public constructor() {
    super('The API key does not include the required scope.');
    this.name = 'EnterpriseGatewayScopeError';
  }
}

export class EnterpriseGatewayRateLimitError extends Error {
  public constructor(readonly resetAt: number) {
    super('The API gateway rate limit has been exceeded.');
    this.name = 'EnterpriseGatewayRateLimitError';
  }
}

export class EnterpriseSsoConfigurationError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = 'EnterpriseSsoConfigurationError';
  }
}
