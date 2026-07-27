import { createHash, randomBytes } from 'node:crypto';

const assistantRateLimitWindowMilliseconds = 60_000;
const maximumAssistantRequestsPerWindow = 12;
const rateLimitSalt = randomBytes(16).toString('hex');
const rateLimitEntries = new Map<string, { count: number; resetAt: number }>();

export type AssistantRateLimitResult = Readonly<{
  readonly allowed: boolean;
  readonly retryAfterSeconds: number;
}>;

function getRequestIdentifier(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  const forwardedAddress = forwardedFor?.split(',')[0]?.trim();
  const source = forwardedAddress ?? request.headers.get('x-real-ip') ?? 'anonymous';

  return createHash('sha256').update(`${rateLimitSalt}:${source}`).digest('hex');
}

function removeExpiredEntries(now: number): void {
  for (const [key, entry] of rateLimitEntries) {
    if (entry.resetAt <= now) {
      rateLimitEntries.delete(key);
    }
  }
}

export function consumeAssistantRateLimit(
  request: Request,
  now = Date.now(),
): AssistantRateLimitResult {
  removeExpiredEntries(now);

  const key = getRequestIdentifier(request);
  const existingEntry = rateLimitEntries.get(key);

  if (existingEntry !== undefined && existingEntry.resetAt > now) {
    if (existingEntry.count >= maximumAssistantRequestsPerWindow) {
      return {
        allowed: false,
        retryAfterSeconds: Math.max(1, Math.ceil((existingEntry.resetAt - now) / 1_000)),
      };
    }

    existingEntry.count += 1;

    return { allowed: true, retryAfterSeconds: 0 };
  }

  rateLimitEntries.set(key, {
    count: 1,
    resetAt: now + assistantRateLimitWindowMilliseconds,
  });

  return { allowed: true, retryAfterSeconds: 0 };
}
