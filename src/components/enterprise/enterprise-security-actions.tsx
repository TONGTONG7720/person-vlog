'use client';

import { CheckCircle2, Clipboard, LoaderCircle, Save, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { FormEvent } from 'react';
import { useState } from 'react';

type EnterpriseSecurityActionsProps = Readonly<{
  readonly domains: readonly Readonly<{
    readonly domain: string;
    readonly id: string;
    readonly verificationToken: string;
    readonly verifiedAt: string | null;
  }>[];
  readonly organizationSlug: string;
  readonly policy: Readonly<{
    readonly allowPersonalApiKeys: boolean;
    readonly requireMfa: boolean;
    readonly requireSso: boolean;
    readonly sensitiveDataScanning: boolean;
  }>;
  readonly reviewDocuments: readonly Readonly<{
    readonly findings: readonly string[];
    readonly id: string;
    readonly title: string;
  }>[];
}>;

type RequestState = Readonly<{
  readonly kind: 'idle' | 'loading' | 'error' | 'success';
  readonly message: string;
}>;

export function EnterpriseSecurityActions({
  domains,
  organizationSlug,
  policy,
  reviewDocuments,
}: EnterpriseSecurityActionsProps): React.JSX.Element {
  const router = useRouter();
  const [state, setState] = useState<RequestState>({ kind: 'idle', message: '' });
  const requestSuffix = `?organization=${encodeURIComponent(organizationSlug)}`;

  async function submitPolicy(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setState({ kind: 'loading', message: '正在保存企业安全策略…' });

    try {
      await requestJson(`/api/v1/enterprise/security${requestSuffix}`, {
        body: JSON.stringify({
          allowPersonalApiKeys: form.has('allowPersonalApiKeys'),
          requireMfa: form.has('requireMfa'),
          requireSso: form.has('requireSso'),
          sensitiveDataScanning: form.has('sensitiveDataScanning'),
        }),
        method: 'PATCH',
      });
      setState({ kind: 'success', message: '安全策略已保存。' });
      router.refresh();
    } catch (error) {
      setState({ kind: 'error', message: getErrorMessage(error) });
    }
  }

  async function submitDomain(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setState({ kind: 'loading', message: '正在生成 DNS 验证令牌…' });

    try {
      await requestJson(`/api/v1/enterprise/security/domains${requestSuffix}`, {
        body: JSON.stringify({ domain: textValue(form, 'domain') }),
        method: 'POST',
      });
      event.currentTarget.reset();
      setState({ kind: 'success', message: 'DNS TXT 令牌已生成，请配置后执行验证。' });
      router.refresh();
    } catch (error) {
      setState({ kind: 'error', message: getErrorMessage(error) });
    }
  }

  async function verifyDomain(domainId: string): Promise<void> {
    setState({ kind: 'loading', message: '正在查询 DNS TXT 记录…' });

    try {
      await requestJson(`/api/v1/enterprise/security/domains/${domainId}/verify${requestSuffix}`, {
        method: 'POST',
      });
      setState({ kind: 'success', message: 'DNS 验证已完成；若未通过，请稍后等待 DNS 生效。' });
      router.refresh();
    } catch (error) {
      setState({ kind: 'error', message: getErrorMessage(error) });
    }
  }

  async function submitSso(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const authorizationUrl = textValue(form, 'authorizationUrl');
    const metadataUrl = textValue(form, 'metadataUrl');
    const clientId = textValue(form, 'clientId');
    const secretReference = textValue(form, 'secretReference');
    setState({ kind: 'loading', message: '正在保存 SSO 配置边界…' });

    try {
      await requestJson(`/api/v1/enterprise/security/sso${requestSuffix}`, {
        body: JSON.stringify({
          ...(authorizationUrl === '' ? {} : { authorizationUrl }),
          ...(clientId === '' ? {} : { clientId }),
          enabled: form.has('enabled'),
          ...(metadataUrl === '' ? {} : { metadataUrl }),
          provider: textValue(form, 'provider'),
          ...(secretReference === '' ? {} : { secretReference }),
        }),
        method: 'PUT',
      });
      setState({ kind: 'success', message: 'SSO 配置已保存。域名与环境变量就绪后才会启用。' });
      router.refresh();
    } catch (error) {
      setState({ kind: 'error', message: getErrorMessage(error) });
    }
  }

  async function approveDocument(documentId: string): Promise<void> {
    setState({ kind: 'loading', message: '正在确认安全复核结果…' });

    try {
      await requestJson(
        `/api/v1/enterprise/security/documents/${documentId}/approve${requestSuffix}`,
        { method: 'POST' },
      );
      setState({ kind: 'success', message: '文档已解除复核状态，AI 管理员可重新处理该文档。' });
      router.refresh();
    } catch (error) {
      setState({ kind: 'error', message: getErrorMessage(error) });
    }
  }

  return (
    <section aria-label="企业安全操作" className="enterprise-security-actions">
      {state.kind === 'idle' ? null : (
        <p aria-live="polite" className="enterprise-security-feedback" data-state={state.kind}>
          {state.kind === 'loading' ? (
            <LoaderCircle aria-hidden="true" size={16} />
          ) : (
            <ShieldCheck aria-hidden="true" size={16} />
          )}
          {state.message}
        </p>
      )}
      <div className="enterprise-security-action-grid">
        <form className="enterprise-security-form" onSubmit={submitPolicy}>
          <p className="saas-kicker">POLICY</p>
          <h2>安全基线</h2>
          <label>
            <input defaultChecked={policy.requireSso} name="requireSso" type="checkbox" />
            要求企业 SSO
          </label>
          <label>
            <input defaultChecked={policy.requireMfa} name="requireMfa" type="checkbox" />
            要求 MFA
          </label>
          <label>
            <input
              defaultChecked={policy.sensitiveDataScanning}
              name="sensitiveDataScanning"
              type="checkbox"
            />
            启用 AI 内容安全扫描
          </label>
          <label>
            <input
              defaultChecked={policy.allowPersonalApiKeys}
              name="allowPersonalApiKeys"
              type="checkbox"
            />
            允许个人 API Key
          </label>
          <button
            className="saas-secondary-button"
            disabled={state.kind === 'loading'}
            type="submit"
          >
            <Save aria-hidden="true" size={16} />
            <span>保存策略</span>
          </button>
        </form>
        <form className="enterprise-security-form" onSubmit={submitDomain}>
          <p className="saas-kicker">DOMAIN VERIFICATION</p>
          <h2>验证企业域名</h2>
          <label>
            <span>邮箱域名</span>
            <input name="domain" placeholder="company.com" required />
          </label>
          <p>系统会生成 DNS TXT 令牌；只有验证成功的域名才可用于 SSO 发现。</p>
          <button
            className="saas-secondary-button"
            disabled={state.kind === 'loading'}
            type="submit"
          >
            <ShieldCheck aria-hidden="true" size={16} />
            <span>生成验证令牌</span>
          </button>
        </form>
        <form className="enterprise-security-form" onSubmit={submitSso}>
          <p className="saas-kicker">SSO CONFIGURATION</p>
          <h2>SAML / OIDC 配置</h2>
          <label>
            <span>协议</span>
            <select defaultValue="OIDC" name="provider">
              <option value="OIDC">OIDC</option>
              <option value="SAML">SAML</option>
              <option value="OAUTH2">OAuth 2.0</option>
            </select>
          </label>
          <label>
            <span>授权地址（OIDC/OAuth）</span>
            <input
              name="authorizationUrl"
              placeholder="https://idp.example.com/authorize"
              type="url"
            />
          </label>
          <label>
            <span>Metadata 地址（SAML）</span>
            <input name="metadataUrl" placeholder="https://idp.example.com/metadata" type="url" />
          </label>
          <label>
            <span>Client ID（可选）</span>
            <input name="clientId" />
          </label>
          <label>
            <span>密钥环境变量名</span>
            <input name="secretReference" placeholder="ENTERPRISE_SSO_CLIENT_SECRET" />
          </label>
          <label>
            <input name="enabled" type="checkbox" />
            在全部前置条件满足后启用
          </label>
          <button
            className="saas-secondary-button"
            disabled={state.kind === 'loading'}
            type="submit"
          >
            <Save aria-hidden="true" size={16} />
            <span>保存 SSO 配置</span>
          </button>
        </form>
      </div>
      <div className="enterprise-domain-list">
        {domains.map((domain) => (
          <article key={domain.id}>
            <div>
              <strong>{domain.domain}</strong>
              <span>{domain.verifiedAt === null ? '待验证' : '已验证'}</span>
            </div>
            {domain.verifiedAt === null ? (
              <code>{domain.verificationToken}</code>
            ) : (
              <small>DNS 验证已完成</small>
            )}
            {domain.verifiedAt === null ? (
              <div>
                <button
                  className="saas-icon-button"
                  aria-label={`复制 ${domain.domain} 的 DNS 令牌`}
                  onClick={() => void navigator.clipboard?.writeText(domain.verificationToken)}
                  type="button"
                >
                  <Clipboard aria-hidden="true" size={16} />
                </button>
                <button
                  className="saas-secondary-button"
                  disabled={state.kind === 'loading'}
                  onClick={() => void verifyDomain(domain.id)}
                  type="button"
                >
                  <CheckCircle2 aria-hidden="true" size={16} />
                  <span>验证 DNS</span>
                </button>
              </div>
            ) : null}
          </article>
        ))}
      </div>
      {reviewDocuments.length === 0 ? null : (
        <div className="enterprise-security-review-list">
          <h2>待人工复核的 AI 文档</h2>
          {reviewDocuments.map((document) => (
            <article key={document.id}>
              <div>
                <strong>{document.title}</strong>
                <small>{document.findings.join(' / ') || '检测到待复核风险'}</small>
              </div>
              <button
                className="saas-secondary-button"
                disabled={state.kind === 'loading'}
                onClick={() => void approveDocument(document.id)}
                type="button"
              >
                <CheckCircle2 aria-hidden="true" size={16} />
                <span>确认并允许处理</span>
              </button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

async function requestJson(input: RequestInfo | URL, init: RequestInit): Promise<void> {
  const headers = new Headers(init.headers);
  headers.set('Content-Type', 'application/json');
  const response = await fetch(input, { ...init, headers });
  const payload: unknown = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(isMessagePayload(payload) ? payload.message : '请求暂时无法完成。');
  }
}

function textValue(data: FormData, name: string): string {
  const value = data.get(name);

  return typeof value === 'string' ? value.trim() : '';
}

function isMessagePayload(value: unknown): value is Readonly<{ readonly message: string }> {
  return (
    typeof value === 'object' &&
    value !== null &&
    'message' in value &&
    typeof value.message === 'string'
  );
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : '请求暂时无法完成。';
}
