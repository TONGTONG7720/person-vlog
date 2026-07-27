-- Stage 31: tenant-scoped AI Native Application Platform.

CREATE TYPE "AiAppType" AS ENUM ('KNOWLEDGE', 'CUSTOMER', 'SALES', 'DATA', 'WORKFLOW');
CREATE TYPE "AiAppStatus" AS ENUM ('DRAFT', 'TESTING', 'PUBLISHED', 'ARCHIVED');
CREATE TYPE "AiAppEnvironment" AS ENUM ('DEVELOPMENT', 'PRODUCTION');
CREATE TYPE "AiAppAccessRuleKind" AS ENUM ('ALL_MEMBERS', 'ROLE', 'DEPARTMENT', 'MEMBERSHIP');

ALTER TYPE "AiUsageChannel" ADD VALUE 'APP';

ALTER TABLE "AiWorkflow" ADD COLUMN "edges" JSONB NOT NULL DEFAULT '[]';

CREATE TABLE "AiAppTemplate" (
  "id" TEXT NOT NULL,
  "key" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "type" "AiAppType" NOT NULL,
  "config" JSONB NOT NULL,
  "blocks" JSONB NOT NULL,
  "workflow" JSONB NOT NULL,
  "enabled" BOOLEAN NOT NULL DEFAULT true,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AiAppTemplate_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AiApp" (
  "id" TEXT NOT NULL,
  "enterpriseId" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "templateId" TEXT,
  "assistantId" TEXT,
  "workflowId" TEXT,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "description" TEXT,
  "type" "AiAppType" NOT NULL,
  "config" JSONB NOT NULL,
  "blocks" JSONB NOT NULL,
  "status" "AiAppStatus" NOT NULL DEFAULT 'DRAFT',
  "published" BOOLEAN NOT NULL DEFAULT false,
  "activeEnvironment" "AiAppEnvironment" NOT NULL DEFAULT 'DEVELOPMENT',
  "publishedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AiApp_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AiAppVersion" (
  "id" TEXT NOT NULL,
  "appId" TEXT NOT NULL,
  "version" TEXT NOT NULL,
  "environment" "AiAppEnvironment" NOT NULL DEFAULT 'DEVELOPMENT',
  "config" JSONB NOT NULL,
  "blocks" JSONB NOT NULL,
  "workflow" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AiAppVersion_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AiAppAccessRule" (
  "id" TEXT NOT NULL,
  "appId" TEXT NOT NULL,
  "kind" "AiAppAccessRuleKind" NOT NULL,
  "subject" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AiAppAccessRule_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "AiAppTemplate_key_key" ON "AiAppTemplate"("key");
CREATE INDEX "AiAppTemplate_enabled_sortOrder_idx" ON "AiAppTemplate"("enabled", "sortOrder");
CREATE UNIQUE INDEX "AiApp_assistantId_key" ON "AiApp"("assistantId");
CREATE UNIQUE INDEX "AiApp_slug_key" ON "AiApp"("slug");
CREATE UNIQUE INDEX "AiApp_workspaceId_name_key" ON "AiApp"("workspaceId", "name");
CREATE INDEX "AiApp_enterpriseId_organizationId_status_updatedAt_idx" ON "AiApp"("enterpriseId", "organizationId", "status", "updatedAt");
CREATE INDEX "AiApp_organizationId_published_updatedAt_idx" ON "AiApp"("organizationId", "published", "updatedAt");
CREATE INDEX "AiApp_workspaceId_status_updatedAt_idx" ON "AiApp"("workspaceId", "status", "updatedAt");
CREATE UNIQUE INDEX "AiAppVersion_appId_version_key" ON "AiAppVersion"("appId", "version");
CREATE INDEX "AiAppVersion_appId_createdAt_idx" ON "AiAppVersion"("appId", "createdAt");
CREATE INDEX "AiAppVersion_environment_createdAt_idx" ON "AiAppVersion"("environment", "createdAt");
CREATE INDEX "AiAppAccessRule_appId_kind_idx" ON "AiAppAccessRule"("appId", "kind");
CREATE INDEX "AiAppAccessRule_kind_subject_idx" ON "AiAppAccessRule"("kind", "subject");

ALTER TABLE "AiApp" ADD CONSTRAINT "AiApp_enterpriseId_fkey" FOREIGN KEY ("enterpriseId") REFERENCES "Enterprise"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AiApp" ADD CONSTRAINT "AiApp_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AiApp" ADD CONSTRAINT "AiApp_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "AiWorkspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AiApp" ADD CONSTRAINT "AiApp_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "AiAppTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AiApp" ADD CONSTRAINT "AiApp_assistantId_fkey" FOREIGN KEY ("assistantId") REFERENCES "AiAssistant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AiApp" ADD CONSTRAINT "AiApp_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "AiWorkflow"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AiAppVersion" ADD CONSTRAINT "AiAppVersion_appId_fkey" FOREIGN KEY ("appId") REFERENCES "AiApp"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AiAppAccessRule" ADD CONSTRAINT "AiAppAccessRule_appId_fkey" FOREIGN KEY ("appId") REFERENCES "AiApp"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Preserve the membership actor for App usage analytics. API-key calls remain anonymous.
ALTER TABLE "AiAssistantUsageLog" ADD COLUMN "actorMembershipId" TEXT;
CREATE INDEX "AiAssistantUsageLog_actorMembershipId_createdAt_idx" ON "AiAssistantUsageLog"("actorMembershipId", "createdAt");
ALTER TABLE "AiAssistantUsageLog" ADD CONSTRAINT "AiAssistantUsageLog_actorMembershipId_fkey" FOREIGN KEY ("actorMembershipId") REFERENCES "Membership"("id") ON DELETE SET NULL ON UPDATE CASCADE;
