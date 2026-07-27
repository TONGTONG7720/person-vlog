-- Stage 28: public AI developer marketplace, creator profiles, moderation, plugin manifests and usage/revenue boundaries.
CREATE TYPE "MarketplaceItemType" AS ENUM ('AGENT', 'WORKFLOW', 'PROMPT', 'TEMPLATE', 'PLUGIN');
CREATE TYPE "MarketplaceItemStatus" AS ENUM ('DRAFT', 'REVIEW', 'PUBLISHED', 'REJECTED', 'ARCHIVED');
CREATE TYPE "MarketplaceReviewStatus" AS ENUM ('PENDING', 'VISIBLE', 'HIDDEN');
CREATE TYPE "MarketplaceRevenueType" AS ENUM ('SALE', 'PLATFORM_FEE', 'REFUND', 'PAYOUT');
CREATE TYPE "MarketplaceApiUsageStatus" AS ENUM ('COMPLETED', 'REJECTED', 'FAILED');

CREATE TABLE "MarketplaceCreator" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "displayName" TEXT NOT NULL,
  "bio" TEXT,
  "avatarUrl" TEXT,
  "verified" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "MarketplaceCreator_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "MarketplaceItem" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "creatorId" TEXT NOT NULL,
  "type" "MarketplaceItemType" NOT NULL,
  "slug" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "tags" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "priceCents" INTEGER,
  "currency" TEXT NOT NULL DEFAULT 'CNY',
  "status" "MarketplaceItemStatus" NOT NULL DEFAULT 'DRAFT',
  "enabled" BOOLEAN NOT NULL DEFAULT true,
  "manifest" JSONB NOT NULL,
  "reviewReason" TEXT,
  "publishedAt" TIMESTAMP(3),
  "reviewedAt" TIMESTAMP(3),
  "reviewedByUserId" TEXT,
  "usageCount" INTEGER NOT NULL DEFAULT 0,
  "favoriteCount" INTEGER NOT NULL DEFAULT 0,
  "ratingTotal" INTEGER NOT NULL DEFAULT 0,
  "ratingCount" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "MarketplaceItem_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "MarketplaceItemVersion" (
  "id" TEXT NOT NULL,
  "itemId" TEXT NOT NULL,
  "createdByUserId" TEXT,
  "version" TEXT NOT NULL,
  "content" JSONB NOT NULL,
  "changelog" TEXT,
  "artifactUrl" TEXT,
  "artifactHash" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "MarketplaceItemVersion_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "MarketplaceReview" (
  "id" TEXT NOT NULL,
  "itemId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "rating" INTEGER NOT NULL,
  "content" TEXT,
  "status" "MarketplaceReviewStatus" NOT NULL DEFAULT 'PENDING',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "MarketplaceReview_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "MarketplaceFavorite" (
  "itemId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "MarketplaceFavorite_pkey" PRIMARY KEY ("itemId", "userId")
);

CREATE TABLE "MarketplacePlugin" (
  "id" TEXT NOT NULL,
  "itemId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "config" JSONB NOT NULL,
  "permissions" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "enabled" BOOLEAN NOT NULL DEFAULT false,
  "rateLimitPerMinute" INTEGER NOT NULL DEFAULT 20,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "MarketplacePlugin_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "MarketplaceRevenue" (
  "id" TEXT NOT NULL,
  "creatorId" TEXT NOT NULL,
  "itemId" TEXT,
  "amountCents" INTEGER NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'CNY',
  "type" "MarketplaceRevenueType" NOT NULL,
  "providerReference" TEXT,
  "availableAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "MarketplaceRevenue_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "MarketplaceApiUsage" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "itemId" TEXT NOT NULL,
  "apiKeyId" TEXT,
  "status" "MarketplaceApiUsageStatus" NOT NULL,
  "inputTokens" INTEGER NOT NULL DEFAULT 0,
  "outputTokens" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "MarketplaceApiUsage_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "MarketplaceCreator_userId_key" ON "MarketplaceCreator"("userId");
CREATE INDEX "MarketplaceCreator_verified_createdAt_idx" ON "MarketplaceCreator"("verified", "createdAt");
CREATE UNIQUE INDEX "MarketplaceItem_slug_key" ON "MarketplaceItem"("slug");
CREATE INDEX "MarketplaceItem_status_publishedAt_idx" ON "MarketplaceItem"("status", "publishedAt");
CREATE INDEX "MarketplaceItem_creatorId_status_createdAt_idx" ON "MarketplaceItem"("creatorId", "status", "createdAt");
CREATE INDEX "MarketplaceItem_organizationId_status_createdAt_idx" ON "MarketplaceItem"("organizationId", "status", "createdAt");
CREATE INDEX "MarketplaceItem_category_status_publishedAt_idx" ON "MarketplaceItem"("category", "status", "publishedAt");
CREATE UNIQUE INDEX "MarketplaceItemVersion_itemId_version_key" ON "MarketplaceItemVersion"("itemId", "version");
CREATE INDEX "MarketplaceItemVersion_itemId_createdAt_idx" ON "MarketplaceItemVersion"("itemId", "createdAt");
CREATE UNIQUE INDEX "MarketplaceReview_itemId_userId_key" ON "MarketplaceReview"("itemId", "userId");
CREATE INDEX "MarketplaceReview_itemId_status_createdAt_idx" ON "MarketplaceReview"("itemId", "status", "createdAt");
CREATE INDEX "MarketplaceReview_userId_createdAt_idx" ON "MarketplaceReview"("userId", "createdAt");
CREATE INDEX "MarketplaceFavorite_userId_createdAt_idx" ON "MarketplaceFavorite"("userId", "createdAt");
CREATE UNIQUE INDEX "MarketplacePlugin_itemId_key" ON "MarketplacePlugin"("itemId");
CREATE INDEX "MarketplacePlugin_enabled_createdAt_idx" ON "MarketplacePlugin"("enabled", "createdAt");
CREATE UNIQUE INDEX "MarketplaceRevenue_providerReference_key" ON "MarketplaceRevenue"("providerReference");
CREATE INDEX "MarketplaceRevenue_creatorId_createdAt_idx" ON "MarketplaceRevenue"("creatorId", "createdAt");
CREATE INDEX "MarketplaceRevenue_itemId_createdAt_idx" ON "MarketplaceRevenue"("itemId", "createdAt");
CREATE INDEX "MarketplaceApiUsage_organizationId_createdAt_idx" ON "MarketplaceApiUsage"("organizationId", "createdAt");
CREATE INDEX "MarketplaceApiUsage_itemId_createdAt_idx" ON "MarketplaceApiUsage"("itemId", "createdAt");
CREATE INDEX "MarketplaceApiUsage_apiKeyId_createdAt_idx" ON "MarketplaceApiUsage"("apiKeyId", "createdAt");

ALTER TABLE "MarketplaceCreator" ADD CONSTRAINT "MarketplaceCreator_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MarketplaceItem" ADD CONSTRAINT "MarketplaceItem_organizationId_fkey"
  FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MarketplaceItem" ADD CONSTRAINT "MarketplaceItem_creatorId_fkey"
  FOREIGN KEY ("creatorId") REFERENCES "MarketplaceCreator"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MarketplaceItem" ADD CONSTRAINT "MarketplaceItem_reviewedByUserId_fkey"
  FOREIGN KEY ("reviewedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "MarketplaceItemVersion" ADD CONSTRAINT "MarketplaceItemVersion_itemId_fkey"
  FOREIGN KEY ("itemId") REFERENCES "MarketplaceItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MarketplaceItemVersion" ADD CONSTRAINT "MarketplaceItemVersion_createdByUserId_fkey"
  FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "MarketplaceReview" ADD CONSTRAINT "MarketplaceReview_itemId_fkey"
  FOREIGN KEY ("itemId") REFERENCES "MarketplaceItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MarketplaceReview" ADD CONSTRAINT "MarketplaceReview_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MarketplaceFavorite" ADD CONSTRAINT "MarketplaceFavorite_itemId_fkey"
  FOREIGN KEY ("itemId") REFERENCES "MarketplaceItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MarketplaceFavorite" ADD CONSTRAINT "MarketplaceFavorite_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MarketplacePlugin" ADD CONSTRAINT "MarketplacePlugin_itemId_fkey"
  FOREIGN KEY ("itemId") REFERENCES "MarketplaceItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MarketplaceRevenue" ADD CONSTRAINT "MarketplaceRevenue_creatorId_fkey"
  FOREIGN KEY ("creatorId") REFERENCES "MarketplaceCreator"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MarketplaceRevenue" ADD CONSTRAINT "MarketplaceRevenue_itemId_fkey"
  FOREIGN KEY ("itemId") REFERENCES "MarketplaceItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "MarketplaceApiUsage" ADD CONSTRAINT "MarketplaceApiUsage_organizationId_fkey"
  FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MarketplaceApiUsage" ADD CONSTRAINT "MarketplaceApiUsage_itemId_fkey"
  FOREIGN KEY ("itemId") REFERENCES "MarketplaceItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MarketplaceApiUsage" ADD CONSTRAINT "MarketplaceApiUsage_apiKeyId_fkey"
  FOREIGN KEY ("apiKeyId") REFERENCES "AiApiKey"("id") ON DELETE SET NULL ON UPDATE CASCADE;
