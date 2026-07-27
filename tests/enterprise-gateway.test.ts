import { describe, expect, it } from 'vitest';

async function loadEnterpriseGateway() {
  return import('../src/server/enterprise/gateway').catch(() => undefined);
}

describe('Enterprise API Gateway 基础', () => {
  it('要求 API Key 具备最小 agent.execute scope', async () => {
    const gateway = await loadEnterpriseGateway();

    expect(gateway).toBeDefined();

    if (gateway === undefined) {
      return;
    }

    expect(gateway.hasApiScope(['agent.read'], 'agent.execute')).toBe(false);
    expect(gateway.hasApiScope(['agent.execute'], 'agent.execute')).toBe(true);
  });

  it('在固定窗口内拒绝超出企业套餐额度的请求', async () => {
    const gateway = await loadEnterpriseGateway();

    expect(gateway).toBeDefined();

    if (gateway === undefined) {
      return;
    }

    const limiter = new gateway.EnterpriseGatewayRateLimiter({
      limit: 2,
      windowMilliseconds: 60_000,
    });

    expect(limiter.consume('key-a', 1_000).allowed).toBe(true);
    expect(limiter.consume('key-a', 1_001).allowed).toBe(true);
    expect(limiter.consume('key-a', 1_002).allowed).toBe(false);
  });

  it('在窗口结束后重新允许请求', async () => {
    const gateway = await loadEnterpriseGateway();

    expect(gateway).toBeDefined();

    if (gateway === undefined) {
      return;
    }

    const limiter = new gateway.EnterpriseGatewayRateLimiter({
      limit: 1,
      windowMilliseconds: 10,
    });

    expect(limiter.consume('key-a', 1_000).allowed).toBe(true);
    expect(limiter.consume('key-a', 1_010).allowed).toBe(true);
  });

  it('限制同一 API Key 的并发请求，并在释放后恢复额度', async () => {
    const gateway = await loadEnterpriseGateway();

    expect(gateway).toBeDefined();

    if (gateway === undefined) {
      return;
    }

    const limiter = new gateway.EnterpriseGatewayConcurrencyLimiter({ limit: 1 });

    expect(limiter.acquire('key-a')).toBe(true);
    expect(limiter.acquire('key-a')).toBe(false);
    limiter.release('key-a');
    expect(limiter.acquire('key-a')).toBe(true);
  });
});
