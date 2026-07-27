const analyticsRateLimitWindowMilliseconds = 60_000;
const maximumAnalyticsEventsPerWindow = 60;
const rateLimitEntries = new Map<string, { count: number; resetAt: number }>();

export type AnalyticsRateLimitResult = Readonly<{
  readonly allowed: boolean;
  readonly retryAfterSeconds: number;
}>;

export function consumeAnalyticsRateLimit(
  sessionId: string,
  now = Date.now(),
): AnalyticsRateLimitResult {
  removeExpiredEntries(now);

  const existingEntry = rateLimitEntries.get(sessionId);

  if (existingEntry !== undefined && existingEntry.resetAt > now) {
    if (existingEntry.count >= maximumAnalyticsEventsPerWindow) {
      return {
        allowed: false,
        retryAfterSeconds: Math.max(1, Math.ceil((existingEntry.resetAt - now) / 1_000)),
      };
    }

    existingEntry.count += 1;

    return { allowed: true, retryAfterSeconds: 0 };
  }

  rateLimitEntries.set(sessionId, {
    count: 1,
    resetAt: now + analyticsRateLimitWindowMilliseconds,
  });

  return { allowed: true, retryAfterSeconds: 0 };
}

function removeExpiredEntries(now: number): void {
  for (const [sessionId, entry] of rateLimitEntries) {
    if (entry.resetAt <= now) {
      rateLimitEntries.delete(sessionId);
    }
  }
}
