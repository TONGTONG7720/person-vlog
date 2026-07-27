import { z } from 'zod';

const httpsUrlSchema = z
  .string()
  .trim()
  .url()
  .refine((value) => value.startsWith('https://'), {
    message: '地址必须使用 HTTPS。',
  });

export const enterpriseSecurityPolicySchema = z.object({
  allowPersonalApiKeys: z.boolean(),
  requireMfa: z.boolean(),
  requireSso: z.boolean(),
  sensitiveDataScanning: z.boolean(),
});

export const enterpriseDomainSchema = z.object({
  domain: z.string().trim().min(4).max(253),
});

export const enterpriseDepartmentSchema = z.object({
  name: z.string().trim().min(2).max(120),
});

export const enterpriseSsoConnectionSchema = z.object({
  authorizationUrl: httpsUrlSchema.optional(),
  clientId: z.string().trim().min(2).max(240).optional(),
  enabled: z.boolean().default(false),
  metadataUrl: httpsUrlSchema.optional(),
  provider: z.enum(['SAML', 'OIDC', 'OAUTH2']),
  secretReference: z
    .string()
    .trim()
    .regex(/^[A-Z][A-Z0-9_]{2,80}$/u)
    .optional(),
});
