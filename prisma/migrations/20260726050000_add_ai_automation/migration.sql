-- Stage 24: AI business automation, reviewable drafts, usage logs and model controls.
CREATE TYPE "AiAgentType" AS ENUM ('LEAD', 'PROPOSAL', 'CONTENT', 'KNOWLEDGE', 'PROJECT', 'MEETING');
CREATE TYPE "AiUsageStatus" AS ENUM ('COMPLETED', 'FAILED', 'SKIPPED');
CREATE TYPE "AiContentDraftStatus" AS ENUM ('DRAFT', 'REVIEWED', 'ARCHIVED');
CREATE TYPE "AiProjectPlanStatus" AS ENUM ('DRAFT', 'APPROVED', 'ARCHIVED');
CREATE TYPE "NotificationChannelType" AS ENUM ('EMAIL', 'WECHAT', 'TELEGRAM');

ALTER TABLE "Lead"
    ADD COLUMN "aiSummary" TEXT,
    ADD COLUMN "aiCategory" TEXT,
    ADD COLUMN "aiDifficulty" TEXT,
    ADD COLUMN "aiSuggestedService" TEXT,
    ADD COLUMN "aiQuestions" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

ALTER TABLE "CrmTask" ADD COLUMN "projectId" TEXT;
ALTER TABLE "Proposal" ADD COLUMN "aiGenerated" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Knowledge"
    ADD COLUMN "source" TEXT,
    ADD COLUMN "aiGenerated" BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE "MeetingNote" (
    "id" TEXT NOT NULL,
    "leadId" TEXT,
    "content" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MeetingNote_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AiContentDraft" (
    "id" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "outline" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "seoDescription" TEXT NOT NULL,
    "xiaohongshuDirection" TEXT NOT NULL,
    "videoScript" TEXT NOT NULL,
    "status" "AiContentDraftStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiContentDraft_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AiProjectPlan" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "tasks" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "status" "AiProjectPlanStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiProjectPlan_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AiModelConfig" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "priority" INTEGER NOT NULL DEFAULT 100,
    "maxTokens" INTEGER NOT NULL DEFAULT 1200,
    "dailyLimit" INTEGER,
    "monthlyLimit" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiModelConfig_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AiUsageLog" (
    "id" TEXT NOT NULL,
    "agent" "AiAgentType" NOT NULL,
    "status" "AiUsageStatus" NOT NULL,
    "provider" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "inputTokens" INTEGER NOT NULL DEFAULT 0,
    "outputTokens" INTEGER NOT NULL DEFAULT 0,
    "costMicros" INTEGER NOT NULL DEFAULT 0,
    "modelConfigId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiUsageLog_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Prompt" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Prompt_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "NotificationChannel" (
    "id" TEXT NOT NULL,
    "type" "NotificationChannelType" NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotificationChannel_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "CrmTask_projectId_createdAt_idx" ON "CrmTask"("projectId", "createdAt");
CREATE INDEX "MeetingNote_leadId_createdAt_idx" ON "MeetingNote"("leadId", "createdAt");
CREATE INDEX "AiContentDraft_status_updatedAt_idx" ON "AiContentDraft"("status", "updatedAt");
CREATE INDEX "AiProjectPlan_projectId_updatedAt_idx" ON "AiProjectPlan"("projectId", "updatedAt");
CREATE INDEX "AiProjectPlan_status_updatedAt_idx" ON "AiProjectPlan"("status", "updatedAt");
CREATE UNIQUE INDEX "AiModelConfig_provider_model_key" ON "AiModelConfig"("provider", "model");
CREATE INDEX "AiModelConfig_enabled_priority_idx" ON "AiModelConfig"("enabled", "priority");
CREATE INDEX "AiUsageLog_agent_createdAt_idx" ON "AiUsageLog"("agent", "createdAt");
CREATE INDEX "AiUsageLog_status_createdAt_idx" ON "AiUsageLog"("status", "createdAt");
CREATE INDEX "AiUsageLog_modelConfigId_createdAt_idx" ON "AiUsageLog"("modelConfigId", "createdAt");
CREATE UNIQUE INDEX "Prompt_name_version_key" ON "Prompt"("name", "version");
CREATE INDEX "Prompt_name_enabled_version_idx" ON "Prompt"("name", "enabled", "version");
CREATE UNIQUE INDEX "NotificationChannel_type_key" ON "NotificationChannel"("type");

ALTER TABLE "CrmTask"
    ADD CONSTRAINT "CrmTask_projectId_fkey"
    FOREIGN KEY ("projectId") REFERENCES "CrmProject"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "MeetingNote"
    ADD CONSTRAINT "MeetingNote_leadId_fkey"
    FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "AiProjectPlan"
    ADD CONSTRAINT "AiProjectPlan_projectId_fkey"
    FOREIGN KEY ("projectId") REFERENCES "CrmProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "AiUsageLog"
    ADD CONSTRAINT "AiUsageLog_modelConfigId_fkey"
    FOREIGN KEY ("modelConfigId") REFERENCES "AiModelConfig"("id") ON DELETE SET NULL ON UPDATE CASCADE;
