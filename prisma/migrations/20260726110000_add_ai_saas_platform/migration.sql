-- Stage 27: tenant-isolated AI workspaces, RAG knowledge, API access and usage metering.
ALTER TYPE "SaasRoleKey" ADD VALUE IF NOT EXISTS 'VIEWER';

CREATE TYPE "AiDocumentStatus" AS ENUM ('UPLOADING', 'PROCESSING', 'READY', 'FAILED');
CREATE TYPE "AiDocumentSourceType" AS ENUM ('TEXT', 'MARKDOWN', 'PDF', 'DOCX');
CREATE TYPE "AiDocumentJobStatus" AS ENUM ('QUEUED', 'PROCESSING', 'COMPLETED', 'FAILED');
CREATE TYPE "AiUsageChannel" AS ENUM ('DASHBOARD', 'API');

CREATE TABLE "AiWorkspace" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "description" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AiWorkspace_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AgentTemplate" (
  "id" TEXT NOT NULL,
  "key" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "systemPrompt" TEXT NOT NULL,
  "enabled" BOOLEAN NOT NULL DEFAULT true,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AgentTemplate_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AiAssistant" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "templateId" TEXT,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "description" TEXT,
  "systemPrompt" TEXT NOT NULL,
  "model" TEXT NOT NULL,
  "temperature" DOUBLE PRECISION NOT NULL DEFAULT 0.2,
  "topK" INTEGER NOT NULL DEFAULT 5,
  "similarityThreshold" DOUBLE PRECISION NOT NULL DEFAULT 0.12,
  "enabled" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AiAssistant_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AiPromptVersion" (
  "id" TEXT NOT NULL,
  "assistantId" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "version" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AiPromptVersion_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AiKnowledgeDocument" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "uploadedByMembershipId" TEXT,
  "title" TEXT NOT NULL,
  "sourceType" "AiDocumentSourceType" NOT NULL,
  "content" TEXT,
  "pathname" TEXT,
  "contentType" TEXT,
  "size" INTEGER,
  "storageProvider" "ProjectFileStorageProvider",
  "status" "AiDocumentStatus" NOT NULL DEFAULT 'UPLOADING',
  "chunkSize" INTEGER NOT NULL DEFAULT 800,
  "chunkOverlap" INTEGER NOT NULL DEFAULT 120,
  "errorMessage" TEXT,
  "processedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AiKnowledgeDocument_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AiVectorDocument" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "documentId" TEXT NOT NULL,
  "chunkIndex" INTEGER NOT NULL,
  "content" TEXT NOT NULL,
  "tokenCount" INTEGER NOT NULL DEFAULT 0,
  "metadata" JSONB NOT NULL,
  "embedding" vector,
  "embeddingModel" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AiVectorDocument_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AiDocumentPermission" (
  "id" TEXT NOT NULL,
  "documentId" TEXT NOT NULL,
  "roleKey" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AiDocumentPermission_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AiDocumentJob" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "documentId" TEXT NOT NULL,
  "kind" TEXT NOT NULL,
  "status" "AiDocumentJobStatus" NOT NULL DEFAULT 'QUEUED',
  "attempts" INTEGER NOT NULL DEFAULT 0,
  "errorMessage" TEXT,
  "startedAt" TIMESTAMP(3),
  "completedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AiDocumentJob_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AiApiKey" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "createdByMembershipId" TEXT,
  "name" TEXT NOT NULL,
  "prefix" TEXT NOT NULL,
  "keyHash" TEXT NOT NULL,
  "lastUsedAt" TIMESTAMP(3),
  "revokedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AiApiKey_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AiAssistantUsageLog" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "assistantId" TEXT,
  "channel" "AiUsageChannel" NOT NULL,
  "status" "AiUsageStatus" NOT NULL,
  "model" TEXT NOT NULL,
  "inputTokens" INTEGER NOT NULL DEFAULT 0,
  "outputTokens" INTEGER NOT NULL DEFAULT 0,
  "costMicros" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AiAssistantUsageLog_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "AiWorkspace_organizationId_slug_key" ON "AiWorkspace"("organizationId", "slug");
CREATE INDEX "AiWorkspace_organizationId_createdAt_idx" ON "AiWorkspace"("organizationId", "createdAt");
CREATE UNIQUE INDEX "AgentTemplate_key_key" ON "AgentTemplate"("key");
CREATE INDEX "AgentTemplate_enabled_sortOrder_idx" ON "AgentTemplate"("enabled", "sortOrder");
CREATE UNIQUE INDEX "AiAssistant_workspaceId_slug_key" ON "AiAssistant"("workspaceId", "slug");
CREATE INDEX "AiAssistant_organizationId_createdAt_idx" ON "AiAssistant"("organizationId", "createdAt");
CREATE INDEX "AiAssistant_workspaceId_enabled_updatedAt_idx" ON "AiAssistant"("workspaceId", "enabled", "updatedAt");
CREATE UNIQUE INDEX "AiPromptVersion_assistantId_version_key" ON "AiPromptVersion"("assistantId", "version");
CREATE INDEX "AiPromptVersion_assistantId_createdAt_idx" ON "AiPromptVersion"("assistantId", "createdAt");
CREATE UNIQUE INDEX "AiKnowledgeDocument_pathname_key" ON "AiKnowledgeDocument"("pathname");
CREATE INDEX "AiKnowledgeDocument_organizationId_createdAt_idx" ON "AiKnowledgeDocument"("organizationId", "createdAt");
CREATE INDEX "AiKnowledgeDocument_workspaceId_status_updatedAt_idx" ON "AiKnowledgeDocument"("workspaceId", "status", "updatedAt");
CREATE UNIQUE INDEX "AiVectorDocument_documentId_chunkIndex_key" ON "AiVectorDocument"("documentId", "chunkIndex");
CREATE INDEX "AiVectorDocument_organizationId_workspaceId_createdAt_idx" ON "AiVectorDocument"("organizationId", "workspaceId", "createdAt");
CREATE INDEX "AiVectorDocument_workspaceId_documentId_idx" ON "AiVectorDocument"("workspaceId", "documentId");
CREATE UNIQUE INDEX "AiDocumentPermission_documentId_roleKey_key" ON "AiDocumentPermission"("documentId", "roleKey");
CREATE INDEX "AiDocumentPermission_roleKey_idx" ON "AiDocumentPermission"("roleKey");
CREATE INDEX "AiDocumentJob_status_createdAt_idx" ON "AiDocumentJob"("status", "createdAt");
CREATE INDEX "AiDocumentJob_organizationId_workspaceId_createdAt_idx" ON "AiDocumentJob"("organizationId", "workspaceId", "createdAt");
CREATE UNIQUE INDEX "AiApiKey_prefix_key" ON "AiApiKey"("prefix");
CREATE INDEX "AiApiKey_organizationId_createdAt_idx" ON "AiApiKey"("organizationId", "createdAt");
CREATE INDEX "AiApiKey_organizationId_revokedAt_idx" ON "AiApiKey"("organizationId", "revokedAt");
CREATE INDEX "AiAssistantUsageLog_organizationId_createdAt_idx" ON "AiAssistantUsageLog"("organizationId", "createdAt");
CREATE INDEX "AiAssistantUsageLog_workspaceId_createdAt_idx" ON "AiAssistantUsageLog"("workspaceId", "createdAt");
CREATE INDEX "AiAssistantUsageLog_assistantId_createdAt_idx" ON "AiAssistantUsageLog"("assistantId", "createdAt");
CREATE INDEX "AiAssistantUsageLog_status_createdAt_idx" ON "AiAssistantUsageLog"("status", "createdAt");

ALTER TABLE "AiWorkspace" ADD CONSTRAINT "AiWorkspace_organizationId_fkey"
  FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AiAssistant" ADD CONSTRAINT "AiAssistant_organizationId_fkey"
  FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AiAssistant" ADD CONSTRAINT "AiAssistant_workspaceId_fkey"
  FOREIGN KEY ("workspaceId") REFERENCES "AiWorkspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AiAssistant" ADD CONSTRAINT "AiAssistant_templateId_fkey"
  FOREIGN KEY ("templateId") REFERENCES "AgentTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AiPromptVersion" ADD CONSTRAINT "AiPromptVersion_assistantId_fkey"
  FOREIGN KEY ("assistantId") REFERENCES "AiAssistant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AiKnowledgeDocument" ADD CONSTRAINT "AiKnowledgeDocument_organizationId_fkey"
  FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AiKnowledgeDocument" ADD CONSTRAINT "AiKnowledgeDocument_workspaceId_fkey"
  FOREIGN KEY ("workspaceId") REFERENCES "AiWorkspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AiKnowledgeDocument" ADD CONSTRAINT "AiKnowledgeDocument_uploadedByMembershipId_fkey"
  FOREIGN KEY ("uploadedByMembershipId") REFERENCES "Membership"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AiVectorDocument" ADD CONSTRAINT "AiVectorDocument_organizationId_fkey"
  FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AiVectorDocument" ADD CONSTRAINT "AiVectorDocument_workspaceId_fkey"
  FOREIGN KEY ("workspaceId") REFERENCES "AiWorkspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AiVectorDocument" ADD CONSTRAINT "AiVectorDocument_documentId_fkey"
  FOREIGN KEY ("documentId") REFERENCES "AiKnowledgeDocument"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AiDocumentPermission" ADD CONSTRAINT "AiDocumentPermission_documentId_fkey"
  FOREIGN KEY ("documentId") REFERENCES "AiKnowledgeDocument"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AiDocumentJob" ADD CONSTRAINT "AiDocumentJob_organizationId_fkey"
  FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AiDocumentJob" ADD CONSTRAINT "AiDocumentJob_workspaceId_fkey"
  FOREIGN KEY ("workspaceId") REFERENCES "AiWorkspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AiDocumentJob" ADD CONSTRAINT "AiDocumentJob_documentId_fkey"
  FOREIGN KEY ("documentId") REFERENCES "AiKnowledgeDocument"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AiApiKey" ADD CONSTRAINT "AiApiKey_organizationId_fkey"
  FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AiApiKey" ADD CONSTRAINT "AiApiKey_createdByMembershipId_fkey"
  FOREIGN KEY ("createdByMembershipId") REFERENCES "Membership"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AiAssistantUsageLog" ADD CONSTRAINT "AiAssistantUsageLog_organizationId_fkey"
  FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AiAssistantUsageLog" ADD CONSTRAINT "AiAssistantUsageLog_workspaceId_fkey"
  FOREIGN KEY ("workspaceId") REFERENCES "AiWorkspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AiAssistantUsageLog" ADD CONSTRAINT "AiAssistantUsageLog_assistantId_fkey"
  FOREIGN KEY ("assistantId") REFERENCES "AiAssistant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
