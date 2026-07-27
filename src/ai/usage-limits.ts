export type AiUsageDecision =
  | Readonly<{ readonly kind: 'allowed' }>
  | Readonly<{ readonly kind: 'daily-limit-reached' }>
  | Readonly<{ readonly kind: 'monthly-limit-reached' }>;

export type AiUsageLimitInput = Readonly<{
  readonly dailyLimit: number | null;
  readonly monthlyLimit: number | null;
  readonly usedThisMonth: number;
  readonly usedToday: number;
}>;

export function getAiUsageDecision(
  limits: AiUsageLimitInput,
  requestedTokens: number,
): AiUsageDecision {
  if (limits.dailyLimit !== null && limits.usedToday + requestedTokens > limits.dailyLimit) {
    return { kind: 'daily-limit-reached' };
  }

  if (
    limits.monthlyLimit !== null &&
    limits.usedThisMonth + requestedTokens > limits.monthlyLimit
  ) {
    return { kind: 'monthly-limit-reached' };
  }

  return { kind: 'allowed' };
}
