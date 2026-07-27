import {
  scanEnterpriseAiContent,
  type EnterpriseAiSafetyResult,
} from '@/server/enterprise/security';
import { writeEnterpriseAuditLog } from '@/server/enterprise/audit';
import { requireCmsDatabase } from '@/server/cms/database';
import { requireSaasPermission, type SaasContext } from '@/server/saas/auth';
import { saasPermissions } from '@/server/saas/rbac';

export type EnterpriseSecurityPolicyInput = Readonly<{
  readonly allowPersonalApiKeys: boolean;
  readonly requireMfa: boolean;
  readonly requireSso: boolean;
  readonly sensitiveDataScanning: boolean;
}>;

export async function getEnterpriseSecurityOverview(context: SaasContext) {
  requireSaasPermission(context, saasPermissions.securityManage);
  const database = requireCmsDatabase();
  const policy = await ensureEnterpriseSecurityPolicy(context);
  const [domains, ssoConnections, auditLogs, documents, reviewDocuments, apiKeys] =
    await Promise.all([
      database.enterpriseDomain.findMany({
        orderBy: { createdAt: 'desc' },
        select: { domain: true, id: true, verificationToken: true, verifiedAt: true },
        where: { enterpriseId: context.enterprise.id },
      }),
      database.sSOConnection.findMany({
        orderBy: { updatedAt: 'desc' },
        select: { enabled: true, id: true, provider: true, updatedAt: true },
        where: { enterpriseId: context.enterprise.id },
      }),
      database.auditLog.findMany({
        include: { user: { select: { email: true } } },
        orderBy: { createdAt: 'desc' },
        take: 20,
        where: { enterpriseId: context.enterprise.id, organizationId: context.organization.id },
      }),
      database.aiKnowledgeDocument.groupBy({
        _count: { _all: true },
        by: ['status'],
        where: { enterpriseId: context.enterprise.id, organizationId: context.organization.id },
      }),
      database.aiKnowledgeDocument.findMany({
        orderBy: { updatedAt: 'desc' },
        select: { id: true, securityFindings: true, title: true, updatedAt: true },
        take: 20,
        where: {
          enterpriseId: context.enterprise.id,
          organizationId: context.organization.id,
          status: 'SECURITY_REVIEW',
        },
      }),
      database.aiApiKey.findMany({
        select: { expiresAt: true, revokedAt: true },
        where: { enterpriseId: context.enterprise.id, organizationId: context.organization.id },
      }),
    ]);

  const now = new Date();
  const activeKeyCount = apiKeys.filter(
    (key) => key.revokedAt === null && (key.expiresAt === null || key.expiresAt > now),
  ).length;

  return {
    activeKeyCount,
    auditLogs,
    documents,
    domains,
    enterprise: context.enterprise,
    policy,
    reviewDocuments,
    ssoConnections,
  };
}

export async function ensureEnterpriseSecurityPolicy(context: SaasContext) {
  const database = requireCmsDatabase();

  return database.enterpriseSecurityPolicy.upsert({
    create: { enterpriseId: context.enterprise.id },
    update: {},
    where: { enterpriseId: context.enterprise.id },
  });
}

export async function updateEnterpriseSecurityPolicy(
  context: SaasContext,
  input: EnterpriseSecurityPolicyInput,
) {
  requireSaasPermission(context, saasPermissions.securityManage);
  const database = requireCmsDatabase();

  const policy = await database.enterpriseSecurityPolicy.upsert({
    create: { enterpriseId: context.enterprise.id, ...input },
    update: input,
    where: { enterpriseId: context.enterprise.id },
  });

  await writeEnterpriseAuditLog({
    action: 'enterprise.security_policy.updated',
    enterpriseId: context.enterprise.id,
    organizationId: context.organization.id,
    resource: 'enterprise_security_policy',
    resourceId: policy.id,
    userId: context.user.id,
  });

  return policy;
}

export async function evaluateEnterpriseAiContent(
  context: SaasContext,
  content: string,
): Promise<EnterpriseAiSafetyResult> {
  const policy = await ensureEnterpriseSecurityPolicy(context);

  return policy.sensitiveDataScanning
    ? scanEnterpriseAiContent(content)
    : { findings: [], status: 'ALLOW' };
}
