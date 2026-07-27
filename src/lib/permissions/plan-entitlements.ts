import { z } from 'zod';

export const planFeatures = [
  'aiWorkspace',
  'apiAccess',
  'developerApi',
  'marketplacePublish',
  'privateKnowledge',
  'prioritySupport',
] as const;

export type PlanFeature = (typeof planFeatures)[number];

export const planLimitFeatures = [
  'aiApps',
  'aiAssistants',
  'aiDocuments',
  'aiMessages',
  'aiTokens',
  'marketplaceApiRequests',
  'marketplaceItems',
  'members',
  'projects',
  'storageBytes',
  'workspaces',
] as const;

export type PlanLimitFeature = (typeof planLimitFeatures)[number];

const planFeatureSchema = z.object({
  aiWorkspace: z.boolean(),
  apiAccess: z.boolean(),
  developerApi: z.boolean().default(false),
  marketplacePublish: z.boolean().default(false),
  privateKnowledge: z.boolean(),
  prioritySupport: z.boolean(),
});

const planLimitSchema = z.object({
  aiApps: z.number().int().nonnegative().nullable().default(1),
  aiAssistants: z.number().int().nonnegative().nullable().default(0),
  aiDocuments: z.number().int().nonnegative().nullable().default(0),
  aiMessages: z.number().int().nonnegative().nullable(),
  aiTokens: z.number().int().nonnegative().nullable().default(0),
  marketplaceApiRequests: z.number().int().nonnegative().nullable().default(0),
  marketplaceItems: z.number().int().nonnegative().nullable().default(0),
  members: z.number().int().positive().nullable(),
  projects: z.number().int().positive().nullable(),
  storageBytes: z.number().int().positive().nullable(),
  workspaces: z.number().int().positive().nullable(),
});

const planEntitlementsSchema = z.object({ features: planFeatureSchema, limits: planLimitSchema });

export type PlanEntitlements = Readonly<{
  readonly features: Readonly<Record<PlanFeature, boolean>>;
  readonly limits: Readonly<Record<PlanLimitFeature, number | null>>;
}>;

export type PlanLimitDecision =
  | Readonly<{ readonly kind: 'allowed'; readonly limit: number | null; readonly used: number }>
  | Readonly<{ readonly kind: 'limit-reached'; readonly limit: number; readonly used: number }>;

type PlanLimitCheckInput = Readonly<{
  readonly current: number;
  readonly entitlements: PlanEntitlements;
  readonly feature: PlanLimitFeature;
  readonly requested: number;
}>;

export class PlanEntitlementsParseError extends Error {
  public constructor() {
    super('Plan entitlements are not valid.');
    this.name = 'PlanEntitlementsParseError';
  }
}

export function parsePlanEntitlements(input: unknown): PlanEntitlements {
  const parsed = planEntitlementsSchema.safeParse(input);

  if (!parsed.success) {
    throw new PlanEntitlementsParseError();
  }

  return { features: parsed.data.features, limits: parsed.data.limits };
}

export function canUseFeature(entitlements: PlanEntitlements, feature: PlanFeature): boolean {
  return entitlements.features[feature];
}

export function checkPlanLimit(input: PlanLimitCheckInput): PlanLimitDecision {
  const limit = input.entitlements.limits[input.feature];
  const requested = Math.max(0, input.requested);
  const used = Math.max(0, input.current);

  if (limit === null || used + requested <= limit) {
    return { kind: 'allowed', limit, used: used + requested };
  }

  return { kind: 'limit-reached', limit, used };
}
