export const enterpriseAiSafetyStatuses = ['ALLOW', 'REVIEW_REQUIRED', 'BLOCKED'] as const;

export type EnterpriseAiSafetyStatus = (typeof enterpriseAiSafetyStatuses)[number];

export type EnterpriseAiSafetyResult = Readonly<{
  readonly findings: readonly string[];
  readonly status: EnterpriseAiSafetyStatus;
}>;

type ContentRule = Readonly<{
  readonly finding: string;
  readonly pattern: RegExp;
  readonly status: EnterpriseAiSafetyStatus;
}>;

const contentRules = [
  {
    finding: 'secret.private-key',
    pattern: /-----BEGIN(?: [A-Z]+)? PRIVATE KEY-----/iu,
    status: 'BLOCKED',
  },
  {
    finding: 'secret.api-key',
    pattern: /\b(?:sk|api)[_-][A-Za-z0-9_-]{20,}\b/u,
    status: 'BLOCKED',
  },
  {
    finding: 'prompt-injection.override',
    pattern: /\b(?:ignore|disregard)\s+(?:all\s+)?(?:previous|prior)\s+instructions?\b/iu,
    status: 'REVIEW_REQUIRED',
  },
  {
    finding: 'prompt-injection.system-prompt',
    pattern: /\b(?:reveal|show|print)\s+(?:the\s+)?system\s+prompt\b/iu,
    status: 'REVIEW_REQUIRED',
  },
  {
    finding: 'sensitive.identity-card',
    pattern: /\b\d{17}[\dX]\b/iu,
    status: 'REVIEW_REQUIRED',
  },
] as const satisfies readonly ContentRule[];

export function scanEnterpriseAiContent(content: string): EnterpriseAiSafetyResult {
  const matches = contentRules.filter((rule) => rule.pattern.test(content));
  const findings = matches.map((rule) => rule.finding);

  return {
    findings,
    status: resolveSafetyStatus(matches),
  };
}

function resolveSafetyStatus(rules: readonly ContentRule[]): EnterpriseAiSafetyStatus {
  if (rules.some((rule) => rule.status === 'BLOCKED')) {
    return 'BLOCKED';
  }

  return rules.length === 0 ? 'ALLOW' : 'REVIEW_REQUIRED';
}
