export class SaasResourceNotFoundError extends Error {
  public override readonly name = 'SaasResourceNotFoundError';

  public constructor() {
    super('The requested SaaS resource was not found in this organization.');
  }
}
