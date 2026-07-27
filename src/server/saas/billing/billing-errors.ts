import type { PlanFeature, PlanLimitFeature } from '@/lib/permissions';

export class BillingConfigurationError extends Error {
  public constructor() {
    super('Billing is not configured.');
    this.name = 'BillingConfigurationError';
  }
}

export class BillingPlanUnavailableError extends Error {
  public constructor() {
    super('The requested billing plan is not available.');
    this.name = 'BillingPlanUnavailableError';
  }
}

export class BillingSubscriptionChangeUnavailableError extends Error {
  public constructor() {
    super('The current Stripe subscription must be changed through the supported support flow.');
    this.name = 'BillingSubscriptionChangeUnavailableError';
  }
}

export class BillingStateMappingError extends Error {
  public constructor(public readonly value: string) {
    super(`The billing state ${value} cannot be mapped.`);
    this.name = 'BillingStateMappingError';
  }
}

export class PlanFeatureUnavailableError extends Error {
  public constructor(public readonly feature: PlanFeature) {
    super(`The ${feature} feature is not available on the current plan.`);
    this.name = 'PlanFeatureUnavailableError';
  }
}

export class PlanLimitExceededError extends Error {
  public constructor(
    public readonly feature: PlanLimitFeature,
    public readonly limit: number,
  ) {
    super(`The ${feature} plan limit has been reached.`);
    this.name = 'PlanLimitExceededError';
  }
}
