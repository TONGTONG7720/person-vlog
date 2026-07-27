-- Stage 26: commercial SaaS plans, tenant-scoped billing, usage and lifecycle records.
CREATE TYPE "BillingCycle" AS ENUM ('MONTHLY', 'YEARLY');
CREATE TYPE "OrganizationLifecycleStage" AS ENUM ('LEAD', 'TRIAL', 'CUSTOMER', 'INACTIVE');

ALTER TYPE "UserNotificationKind" ADD VALUE 'BILLING_UPDATED';
ALTER TYPE "UserNotificationKind" ADD VALUE 'TRIAL_ENDING';
ALTER TYPE "UserNotificationKind" ADD VALUE 'SUBSCRIPTION_CANCELLED';

ALTER TABLE "Organization"
  ADD COLUMN "lifecycleStage" "OrganizationLifecycleStage" NOT NULL DEFAULT 'LEAD';

ALTER TABLE "Plan"
  ADD COLUMN "slug" TEXT,
  ADD COLUMN "description" TEXT,
  ADD COLUMN "priceCents" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "currency" TEXT NOT NULL DEFAULT 'CNY',
  ADD COLUMN "billingCycle" "BillingCycle" NOT NULL DEFAULT 'MONTHLY',
  ADD COLUMN "limits" JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN "active" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "trialDays" INTEGER NOT NULL DEFAULT 7,
  ADD COLUMN "sortOrder" INTEGER NOT NULL DEFAULT 0;

UPDATE "Plan"
SET
  "slug" = "key",
  "description" = CASE "key"
    WHEN 'free' THEN '适合体验项目协作、基础交付和有限的 AI 使用。'
    WHEN 'pro' THEN '适合独立开发者管理更多交付项目，并获得更高的 AI 配额。'
    WHEN 'team' THEN '适合需要成员分工、项目协作和稳定交付节奏的小团队。'
    WHEN 'enterprise' THEN '为企业客户提供定制限额、私有知识库、专属支持与交付协同。'
    ELSE '可配置的 SaaS 套餐。'
  END;

ALTER TABLE "Plan"
  ALTER COLUMN "slug" SET NOT NULL,
  ALTER COLUMN "description" SET NOT NULL;

CREATE UNIQUE INDEX "Plan_slug_key" ON "Plan"("slug");
CREATE INDEX "Plan_active_sortOrder_idx" ON "Plan"("active", "sortOrder");
CREATE INDEX "Organization_lifecycleStage_createdAt_idx" ON "Organization"("lifecycleStage", "createdAt");

ALTER TABLE "Subscription"
  ADD COLUMN "currentPeriodStartsAt" TIMESTAMP(3),
  ADD COLUMN "trialEndsAt" TIMESTAMP(3),
  ADD COLUMN "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "cancelledAt" TIMESTAMP(3);

CREATE INDEX "Subscription_organizationId_status_idx" ON "Subscription"("organizationId", "status");

ALTER TABLE "Payment"
  ADD COLUMN "organizationId" TEXT;

UPDATE "Payment" AS payment
SET "organizationId" = subscription."organizationId"
FROM "Subscription" AS subscription
WHERE payment."subscriptionId" = subscription."id";

ALTER TABLE "Payment"
  ALTER COLUMN "organizationId" SET NOT NULL,
  ALTER COLUMN "currency" SET DEFAULT 'CNY';

CREATE INDEX "Payment_organizationId_createdAt_idx" ON "Payment"("organizationId", "createdAt");

ALTER TABLE "Payment"
  ADD CONSTRAINT "Payment_organizationId_fkey"
  FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "Usage" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "feature" TEXT NOT NULL,
  "count" INTEGER NOT NULL DEFAULT 0,
  "period" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Usage_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Usage_organizationId_feature_period_key" ON "Usage"("organizationId", "feature", "period");
CREATE INDEX "Usage_organizationId_period_idx" ON "Usage"("organizationId", "period");

ALTER TABLE "Usage"
  ADD CONSTRAINT "Usage_organizationId_fkey"
  FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "BillingEvent" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT,
  "provider" TEXT NOT NULL,
  "providerEventId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "payload" JSONB NOT NULL,
  "processedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "BillingEvent_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "BillingEvent_providerEventId_key" ON "BillingEvent"("providerEventId");
CREATE INDEX "BillingEvent_organizationId_createdAt_idx" ON "BillingEvent"("organizationId", "createdAt");
CREATE INDEX "BillingEvent_provider_type_createdAt_idx" ON "BillingEvent"("provider", "type", "createdAt");

ALTER TABLE "BillingEvent"
  ADD CONSTRAINT "BillingEvent_organizationId_fkey"
  FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;
