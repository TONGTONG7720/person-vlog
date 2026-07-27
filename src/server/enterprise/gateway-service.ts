import {
  EnterpriseGatewayRateLimitError,
  EnterpriseGatewayScopeError,
} from '@/server/enterprise/errors';
import {
  EnterpriseGatewayConcurrencyLimiter,
  EnterpriseGatewayRateLimiter,
  hasApiScope,
  type EnterpriseApiScope,
  type EnterpriseGatewayRateLimitResult,
} from '@/server/enterprise/gateway';
import type { AiApiKeyIdentity } from '@/server/saas/ai-api-keys';

const gatewayLimit = Number.parseInt(process.env['ENTERPRISE_GATEWAY_RATE_LIMIT'] ?? '60', 10);
const gatewayWindowMilliseconds = Number.parseInt(
  process.env['ENTERPRISE_GATEWAY_RATE_WINDOW_MS'] ?? '60000',
  10,
);
const gatewayConcurrencyLimit = Number.parseInt(
  process.env['ENTERPRISE_GATEWAY_CONCURRENCY_LIMIT'] ?? '4',
  10,
);
const enterpriseGatewayRateLimiter = new EnterpriseGatewayRateLimiter({
  limit: Number.isFinite(gatewayLimit) && gatewayLimit > 0 ? gatewayLimit : 60,
  windowMilliseconds:
    Number.isFinite(gatewayWindowMilliseconds) && gatewayWindowMilliseconds > 0
      ? gatewayWindowMilliseconds
      : 60_000,
});
const enterpriseGatewayConcurrencyLimiter = new EnterpriseGatewayConcurrencyLimiter({
  limit:
    Number.isFinite(gatewayConcurrencyLimit) && gatewayConcurrencyLimit > 0
      ? gatewayConcurrencyLimit
      : 4,
});

export function authorizeEnterpriseGatewayRequest(
  identity: AiApiKeyIdentity,
  requiredScope: EnterpriseApiScope,
): EnterpriseGatewayRateLimitResult {
  if (!hasApiScope(identity.scopes, requiredScope)) {
    throw new EnterpriseGatewayScopeError();
  }

  const rateLimit = enterpriseGatewayRateLimiter.consume(identity.id);

  if (!rateLimit.allowed) {
    throw new EnterpriseGatewayRateLimitError(rateLimit.resetAt);
  }

  return rateLimit;
}

export function openEnterpriseGatewayRequest(
  identity: AiApiKeyIdentity,
  requiredScope: EnterpriseApiScope,
): Readonly<{
  readonly rateLimit: EnterpriseGatewayRateLimitResult;
  readonly release: () => void;
}> {
  const rateLimit = authorizeEnterpriseGatewayRequest(identity, requiredScope);

  if (!enterpriseGatewayConcurrencyLimiter.acquire(identity.id)) {
    throw new EnterpriseGatewayRateLimitError(Date.now() + 1_000);
  }

  return {
    rateLimit,
    release: () => enterpriseGatewayConcurrencyLimiter.release(identity.id),
  };
}
