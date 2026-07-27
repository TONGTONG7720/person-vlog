import { randomBytes } from 'node:crypto';
import { resolveTxt } from 'node:dns/promises';

import { writeEnterpriseAuditLog } from '@/server/enterprise/audit';
import {
  createDomainVerificationToken,
  isSsoConnectionReady,
  normalizeEnterpriseDomain,
  type EnterpriseSsoProvider,
} from '@/server/enterprise/sso';
import { requireCmsDatabase } from '@/server/cms/database';
import { requireSaasPermission, type SaasContext } from '@/server/saas/auth';
import { saasPermissions } from '@/server/saas/rbac';

export type SaveEnterpriseSsoConnectionInput = Readonly<{
  readonly authorizationUrl?: string;
  readonly clientId?: string;
  readonly enabled: boolean;
  readonly metadataUrl?: string;
  readonly provider: EnterpriseSsoProvider;
  readonly secretReference?: string;
}>;

export async function createEnterpriseDomain(context: SaasContext, rawDomain: string) {
  requireSaasPermission(context, saasPermissions.ssoManage);
  const domain = normalizeEnterpriseDomain(rawDomain);

  if (domain === undefined) {
    return undefined;
  }

  const database = requireCmsDatabase();
  const verificationToken = createDomainVerificationToken(() =>
    randomBytes(18).toString('base64url'),
  );
  const existing = await database.enterpriseDomain.findUnique({
    select: { enterpriseId: true, id: true },
    where: { domain },
  });

  if (existing !== null && existing.enterpriseId !== context.enterprise.id) {
    return undefined;
  }

  const record =
    existing === null
      ? await database.enterpriseDomain.create({
          data: { domain, enterpriseId: context.enterprise.id, verificationToken },
        })
      : await database.enterpriseDomain.update({
          data: { verificationToken, verifiedAt: null },
          where: { id: existing.id },
        });

  await writeEnterpriseAuditLog({
    action: 'enterprise.domain.created',
    enterpriseId: context.enterprise.id,
    organizationId: context.organization.id,
    resource: 'enterprise_domain',
    resourceId: record.id,
    userId: context.user.id,
  });

  return record;
}

export async function verifyEnterpriseDomain(
  context: SaasContext,
  domainId: string,
): Promise<boolean> {
  requireSaasPermission(context, saasPermissions.ssoManage);
  const database = requireCmsDatabase();
  const domain = await database.enterpriseDomain.findFirst({
    select: { domain: true, id: true, verificationToken: true },
    where: { enterpriseId: context.enterprise.id, id: domainId },
  });

  if (domain === null) {
    return false;
  }

  try {
    const records = await resolveTxt(domain.domain);
    const verified = records.some((record) => record.join('').includes(domain.verificationToken));

    if (verified) {
      await database.enterpriseDomain.update({
        data: { verifiedAt: new Date() },
        where: { id: domain.id },
      });
      await writeEnterpriseAuditLog({
        action: 'enterprise.domain.verified',
        enterpriseId: context.enterprise.id,
        organizationId: context.organization.id,
        resource: 'enterprise_domain',
        resourceId: domain.id,
        userId: context.user.id,
      });
    }

    return verified;
  } catch {
    return false;
  }
}

export async function saveEnterpriseSsoConnection(
  context: SaasContext,
  input: SaveEnterpriseSsoConnectionInput,
) {
  requireSaasPermission(context, saasPermissions.ssoManage);
  const database = requireCmsDatabase();
  const verifiedDomain = await database.enterpriseDomain.findFirst({
    select: { id: true },
    where: { enterpriseId: context.enterprise.id, verifiedAt: { not: null } },
  });
  const existing = await database.sSOConnection.findFirst({
    select: { id: true, secretReference: true },
    where: { enterpriseId: context.enterprise.id, provider: input.provider },
  });
  const secretReference = input.secretReference ?? existing?.secretReference ?? undefined;
  const metadata = {
    ...(input.authorizationUrl === undefined ? {} : { authorizationUrl: input.authorizationUrl }),
    ...(input.clientId === undefined ? {} : { clientId: input.clientId }),
    ...(input.metadataUrl === undefined ? {} : { metadataUrl: input.metadataUrl }),
  };
  const connectionReady = isSsoConnectionReady({
    ...(input.authorizationUrl === undefined ? {} : { authorizationUrl: input.authorizationUrl }),
    domainVerified: verifiedDomain !== null,
    enabled: input.enabled,
    ...(input.metadataUrl === undefined ? {} : { metadataUrl: input.metadataUrl }),
    provider: input.provider,
  });
  const enabled =
    connectionReady && secretReference !== undefined && process.env[secretReference] !== undefined;
  const record =
    existing === null
      ? await database.sSOConnection.create({
          data: {
            enabled,
            enterpriseId: context.enterprise.id,
            metadata,
            provider: input.provider,
            ...(secretReference === undefined ? {} : { secretReference }),
          },
        })
      : await database.sSOConnection.update({
          data: {
            enabled,
            metadata,
            ...(secretReference === undefined ? {} : { secretReference }),
          },
          where: { id: existing.id },
        });

  await writeEnterpriseAuditLog({
    action: 'enterprise.sso.saved',
    enterpriseId: context.enterprise.id,
    metadata: { enabled, provider: input.provider },
    organizationId: context.organization.id,
    resource: 'sso_connection',
    resourceId: record.id,
    userId: context.user.id,
  });

  return record;
}

export async function getEnterpriseSsoDiscovery(rawDomain: string) {
  const domain = normalizeEnterpriseDomain(rawDomain);

  if (domain === undefined) {
    return undefined;
  }

  const database = requireCmsDatabase();
  const ownership = await database.enterpriseDomain.findFirst({
    select: { enterpriseId: true },
    where: { domain, verifiedAt: { not: null } },
  });

  if (ownership === null) {
    return undefined;
  }

  const connection = await database.sSOConnection.findFirst({
    select: { metadata: true, provider: true },
    where: { enabled: true, enterpriseId: ownership.enterpriseId },
  });

  if (connection === null) {
    return undefined;
  }

  return {
    authorizationUrl: getMetadataText(connection.metadata, 'authorizationUrl'),
    domain,
    provider: connection.provider,
  };
}

function getMetadataText(metadata: unknown, key: string): string | undefined {
  if (!isMetadataRecord(metadata) || !(key in metadata)) {
    return undefined;
  }

  const value = metadata[key];

  return typeof value === 'string' ? value : undefined;
}

function isMetadataRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
