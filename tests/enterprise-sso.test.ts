import { describe, expect, it } from 'vitest';

async function loadEnterpriseSso() {
  return import('../src/server/enterprise/sso').catch(() => undefined);
}

describe('Enterprise SSO 配置边界', () => {
  it('归一化可验证的邮箱域名，不接受 URL 或路径', async () => {
    const sso = await loadEnterpriseSso();

    expect(sso).toBeDefined();

    if (sso === undefined) {
      return;
    }

    expect(sso.normalizeEnterpriseDomain('  Team.Example.COM.  ')).toBe('team.example.com');
    expect(sso.normalizeEnterpriseDomain('https://example.com/login')).toBeUndefined();
  });

  it('只把已验证域名、启用连接和 HTTPS OIDC 地址视为可用 SSO', async () => {
    const sso = await loadEnterpriseSso();

    expect(sso).toBeDefined();

    if (sso === undefined) {
      return;
    }

    expect(
      sso.isSsoConnectionReady({
        authorizationUrl: 'https://login.example.com/authorize',
        domainVerified: true,
        enabled: true,
        provider: 'OIDC',
      }),
    ).toBe(true);
    expect(
      sso.isSsoConnectionReady({
        authorizationUrl: 'http://login.example.com/authorize',
        domainVerified: true,
        enabled: true,
        provider: 'OIDC',
      }),
    ).toBe(false);
  });

  it('生成不包含企业名称或凭证的 DNS TXT 验证令牌', async () => {
    const sso = await loadEnterpriseSso();

    expect(sso).toBeDefined();

    if (sso === undefined) {
      return;
    }

    const token = sso.createDomainVerificationToken(() => 'random-value');

    expect(token).toBe('tong-enterprise=random-value');
  });
});
