import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';

import { writeEnterpriseAuditLog } from '@/server/enterprise/audit';
import { enterpriseApiScopes, type EnterpriseApiScope } from '@/server/enterprise/gateway';
import { requireCmsDatabase } from '@/server/cms/database';
import { requireSaasPermission, type SaasContext } from '@/server/saas/auth';
import { requirePlanFeature } from '@/server/saas/billing/entitlements';
import { SaasResourceNotFoundError } from '@/server/saas/project-errors';
import { saasPermissions } from '@/server/saas/rbac';

const apiKeyPrefix = 'tai_';

export type GeneratedAiApiKey = Readonly<{
  readonly prefix: string;
  readonly secret: string;
}>;

export type AiApiKeyIdentity = Readonly<{
  readonly enterpriseId: string;
  readonly id: string;
  readonly organizationId: string;
  readonly scopes: readonly EnterpriseApiScope[];
}>;

export type CreateSaasAiApiKeyInput = Readonly<{
  readonly expiresAt?: Date;
  readonly name: string;
  readonly scopes?: readonly EnterpriseApiScope[];
}>;

const defaultAiApiKeyScopes: readonly EnterpriseApiScope[] = ['agent.read', 'agent.execute'];

export function createAiApiKey(): GeneratedAiApiKey {
  const secret = `${apiKeyPrefix}${randomBytes(32).toString('base64url')}`;

  return { prefix: secret.slice(0, 12), secret };
}

export function hashAiApiKey(secret: string): string {
  return createHash('sha256').update(secret).digest('hex');
}

export function verifyAiApiKey(secret: string, expectedHash: string): boolean {
  const actual = Buffer.from(hashAiApiKey(secret), 'utf8');
  const expected = Buffer.from(expectedHash, 'utf8');

  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export function normalizeEnterpriseApiScopes(scopes: readonly string[]): EnterpriseApiScope[] {
  return scopes.filter((scope): scope is EnterpriseApiScope =>
    enterpriseApiScopes.some((knownScope) => knownScope === scope),
  );
}

export function isAiApiKeyExpired(expiresAt: Date | undefined, now: Date = new Date()): boolean {
  return expiresAt !== undefined && expiresAt.getTime() <= now.getTime();
}

export async function createSaasAiApiKey(context: SaasContext, input: CreateSaasAiApiKeyInput) {
  requireSaasPermission(context, saasPermissions.apiManage);
  await requirePlanFeature(context, 'apiAccess');
  const generated = createAiApiKey();
  const database = requireCmsDatabase();
  const scopes = normalizeEnterpriseApiScopes(input.scopes ?? defaultAiApiKeyScopes);
  const record = await database.aiApiKey.create({
    data: {
      createdByMembershipId: context.membership.id,
      enterpriseId: context.enterprise.id,
      ...(input.expiresAt === undefined ? {} : { expiresAt: input.expiresAt }),
      keyHash: hashAiApiKey(generated.secret),
      name: input.name,
      organizationId: context.organization.id,
      prefix: generated.prefix,
      scopes,
    },
    select: { createdAt: true, expiresAt: true, id: true, name: true, prefix: true, scopes: true },
  });

  await writeEnterpriseAuditLog({
    action: 'enterprise.api_key.created',
    enterpriseId: context.enterprise.id,
    metadata: { scopes },
    organizationId: context.organization.id,
    resource: 'ai_api_key',
    resourceId: record.id,
    userId: context.user.id,
  });

  return { ...record, secret: generated.secret };
}

export async function getSaasAiApiKeys(context: SaasContext) {
  requireSaasPermission(context, saasPermissions.apiManage);
  const database = requireCmsDatabase();

  return database.aiApiKey.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      createdAt: true,
      expiresAt: true,
      id: true,
      lastUsedAt: true,
      name: true,
      prefix: true,
      revokedAt: true,
      scopes: true,
    },
    where: { enterpriseId: context.enterprise.id, organizationId: context.organization.id },
  });
}

export async function revokeSaasAiApiKey(context: SaasContext, keyId: string): Promise<void> {
  requireSaasPermission(context, saasPermissions.apiManage);
  const database = requireCmsDatabase();
  const result = await database.aiApiKey.updateMany({
    data: { revokedAt: new Date() },
    where: {
      enterpriseId: context.enterprise.id,
      id: keyId,
      organizationId: context.organization.id,
      revokedAt: null,
    },
  });

  if (result.count === 0) {
    throw new SaasResourceNotFoundError();
  }

  await writeEnterpriseAuditLog({
    action: 'enterprise.api_key.revoked',
    enterpriseId: context.enterprise.id,
    organizationId: context.organization.id,
    resource: 'ai_api_key',
    resourceId: keyId,
    userId: context.user.id,
  });
}

export async function deleteSaasAiApiKey(context: SaasContext, keyId: string): Promise<void> {
  requireSaasPermission(context, saasPermissions.apiManage);
  const database = requireCmsDatabase();
  const result = await database.aiApiKey.deleteMany({
    where: {
      enterpriseId: context.enterprise.id,
      id: keyId,
      organizationId: context.organization.id,
    },
  });

  if (result.count === 0) {
    throw new SaasResourceNotFoundError();
  }

  await writeEnterpriseAuditLog({
    action: 'enterprise.api_key.deleted',
    enterpriseId: context.enterprise.id,
    organizationId: context.organization.id,
    resource: 'ai_api_key',
    resourceId: keyId,
    userId: context.user.id,
  });
}

export async function rotateSaasAiApiKey(context: SaasContext, keyId: string) {
  requireSaasPermission(context, saasPermissions.apiManage);
  const database = requireCmsDatabase();
  const existing = await database.aiApiKey.findFirst({
    select: { expiresAt: true, id: true, name: true, scopes: true },
    where: {
      enterpriseId: context.enterprise.id,
      id: keyId,
      organizationId: context.organization.id,
      revokedAt: null,
    },
  });

  if (existing === null || isAiApiKeyExpired(existing.expiresAt ?? undefined)) {
    throw new SaasResourceNotFoundError();
  }

  await database.aiApiKey.update({ data: { revokedAt: new Date() }, where: { id: existing.id } });
  await writeEnterpriseAuditLog({
    action: 'enterprise.api_key.rotated',
    enterpriseId: context.enterprise.id,
    organizationId: context.organization.id,
    resource: 'ai_api_key',
    resourceId: existing.id,
    userId: context.user.id,
  });

  return createSaasAiApiKey(context, {
    ...(existing.expiresAt === null ? {} : { expiresAt: existing.expiresAt }),
    name: existing.name,
    scopes: normalizeEnterpriseApiScopes(existing.scopes),
  });
}

export async function authenticateAiApiKey(
  request: Request,
): Promise<AiApiKeyIdentity | undefined> {
  const secret = getBearerToken(request.headers.get('authorization'));

  if (secret === undefined || !secret.startsWith(apiKeyPrefix)) {
    return undefined;
  }

  const database = requireCmsDatabase();
  const key = await database.aiApiKey.findFirst({
    select: {
      enterpriseId: true,
      expiresAt: true,
      id: true,
      keyHash: true,
      organizationId: true,
      scopes: true,
    },
    where: { prefix: secret.slice(0, 12), revokedAt: null },
  });

  if (
    key === null ||
    isAiApiKeyExpired(key.expiresAt ?? undefined) ||
    !verifyAiApiKey(secret, key.keyHash)
  ) {
    return undefined;
  }

  await database.aiApiKey.update({ data: { lastUsedAt: new Date() }, where: { id: key.id } });

  return {
    enterpriseId: key.enterpriseId,
    id: key.id,
    organizationId: key.organizationId,
    scopes: normalizeEnterpriseApiScopes(key.scopes),
  };
}

function getBearerToken(value: string | null): string | undefined {
  if (value === null || !value.startsWith('Bearer ')) {
    return undefined;
  }

  const token = value.slice('Bearer '.length).trim();

  return token === '' ? undefined : token;
}
