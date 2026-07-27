export const enterpriseApiScopes = [
  'agent.read',
  'agent.execute',
  'knowledge.search',
  'document.upload',
] as const;

export type EnterpriseApiScope = (typeof enterpriseApiScopes)[number];

export type EnterpriseGatewayRateLimiterOptions = Readonly<{
  readonly limit: number;
  readonly windowMilliseconds: number;
}>;

export type EnterpriseGatewayRateLimitResult = Readonly<{
  readonly allowed: boolean;
  readonly remaining: number;
  readonly resetAt: number;
}>;

export type EnterpriseGatewayConcurrencyLimiterOptions = Readonly<{
  readonly limit: number;
}>;

type GatewayWindow = Readonly<{
  readonly count: number;
  readonly startedAt: number;
}>;

export function hasApiScope(scopes: readonly string[], requiredScope: EnterpriseApiScope): boolean {
  return scopes.includes(requiredScope);
}

export class EnterpriseGatewayRateLimiter {
  readonly #options: EnterpriseGatewayRateLimiterOptions;
  readonly #windows = new Map<string, GatewayWindow>();

  public constructor(options: EnterpriseGatewayRateLimiterOptions) {
    this.#options = options;
  }

  public consume(key: string, now: number = Date.now()): EnterpriseGatewayRateLimitResult {
    const activeWindow = this.#windows.get(key);
    const window =
      activeWindow === undefined || now - activeWindow.startedAt >= this.#options.windowMilliseconds
        ? { count: 0, startedAt: now }
        : activeWindow;
    const resetAt = window.startedAt + this.#options.windowMilliseconds;

    if (window.count >= this.#options.limit) {
      return { allowed: false, remaining: 0, resetAt };
    }

    const nextWindow = { count: window.count + 1, startedAt: window.startedAt };
    this.#windows.set(key, nextWindow);

    return {
      allowed: true,
      remaining: Math.max(0, this.#options.limit - nextWindow.count),
      resetAt,
    };
  }
}

export class EnterpriseGatewayConcurrencyLimiter {
  readonly #active = new Map<string, number>();
  readonly #options: EnterpriseGatewayConcurrencyLimiterOptions;

  public constructor(options: EnterpriseGatewayConcurrencyLimiterOptions) {
    this.#options = options;
  }

  public acquire(key: string): boolean {
    const count = this.#active.get(key) ?? 0;

    if (count >= this.#options.limit) {
      return false;
    }

    this.#active.set(key, count + 1);

    return true;
  }

  public release(key: string): void {
    const count = this.#active.get(key) ?? 0;

    if (count <= 1) {
      this.#active.delete(key);
      return;
    }

    this.#active.set(key, count - 1);
  }
}
