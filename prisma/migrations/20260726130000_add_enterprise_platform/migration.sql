-- Stage 29: enterprise hierarchy, organization security, SSO configuration and API gateway boundaries.

ALTER TYPE "SaasRoleKey" ADD VALUE IF NOT EXISTS 'ENTERPRISE_OWNER';
ALTER TYPE "SaasRoleKey" ADD VALUE IF NOT EXISTS 'SECURITY_ADMIN';
ALTER TYPE "SaasRoleKey" ADD VALUE IF NOT EXISTS 'DEPARTMENT_ADMIN';
ALTER TYPE "AiDocumentStatus" ADD VALUE IF NOT EXISTS 'SECURITY_REVIEW';
ALTER TYPE "UserNotificationKind" ADD VALUE IF NOT EXISTS 'ENTERPRISE_MEMBER_JOINED';
ALTER TYPE "UserNotificationKind" ADD VALUE IF NOT EXISTS 'ENTERPRISE_ROLE_CHANGED';
ALTER TYPE "UserNotificationKind" ADD VALUE IF NOT EXISTS 'ENTERPRISE_SECURITY_EVENT';

CREATE TYPE "MembershipStatus" AS ENUM ('ACTIVE', 'INVITED', 'SUSPENDED');
CREATE TYPE "EnterpriseStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'ARCHIVED');
CREATE TYPE "EnterpriseSsoProvider" AS ENUM ('SAML', 'OIDC', 'OAUTH2');

CREATE TABLE "Enterprise" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "domain" TEXT,
  "logo" TEXT,
  "status" "EnterpriseStatus" NOT NULL DEFAULT 'ACTIVE',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Enterprise_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "Organization" ADD COLUMN "enterpriseId" TEXT;

INSERT INTO "Enterprise" ("id", "name", "logo", "status", "createdAt", "updatedAt")
SELECT CONCAT('legacy-', "id"), "name", "logo", 'ACTIVE', "createdAt", "updatedAt"
FROM "Organization";

UPDATE "Organization"
SET "enterpriseId" = CONCAT('legacy-', "id");

CREATE TABLE "Department" (
  "id" TEXT NOT NULL,
  "enterpriseId" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);

INSERT INTO "Department" ("id", "enterpriseId", "organizationId", "name", "createdAt", "updatedAt")
SELECT CONCAT('department-', "id"), "enterpriseId", "id", 'General', "createdAt", "updatedAt"
FROM "Organization";

ALTER TABLE "Permission" ADD COLUMN "name" TEXT;
ALTER TABLE "Permission" ADD COLUMN "resource" TEXT;
ALTER TABLE "Permission" ADD COLUMN "action" TEXT;

UPDATE "Permission"
SET
  "name" = "key",
  "resource" = SPLIT_PART("key", '.', 1),
  "action" = SPLIT_PART("key", '.', 2);

ALTER TABLE "Permission" ALTER COLUMN "name" SET NOT NULL;
ALTER TABLE "Permission" ALTER COLUMN "resource" SET NOT NULL;
ALTER TABLE "Permission" ALTER COLUMN "action" SET NOT NULL;

ALTER TABLE "Membership" ADD COLUMN "enterpriseId" TEXT;
ALTER TABLE "Membership" ADD COLUMN "departmentId" TEXT;
ALTER TABLE "Membership" ADD COLUMN "status" "MembershipStatus" NOT NULL DEFAULT 'ACTIVE';
ALTER TABLE "Membership" ADD COLUMN "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE "Workspace" ADD COLUMN "enterpriseId" TEXT;
ALTER TABLE "Workspace" ADD COLUMN "departmentId" TEXT;
ALTER TABLE "WorkspaceProject" ADD COLUMN "enterpriseId" TEXT;
ALTER TABLE "ProjectTask" ADD COLUMN "enterpriseId" TEXT;
ALTER TABLE "ProjectActivity" ADD COLUMN "enterpriseId" TEXT;
ALTER TABLE "ProjectDocument" ADD COLUMN "enterpriseId" TEXT;
ALTER TABLE "WorkspaceKnowledgeDocument" ADD COLUMN "enterpriseId" TEXT;
ALTER TABLE "WorkspaceKnowledgeEmbedding" ADD COLUMN "enterpriseId" TEXT;
ALTER TABLE "AiWorkspace" ADD COLUMN "enterpriseId" TEXT;
ALTER TABLE "AiAssistant" ADD COLUMN "enterpriseId" TEXT;
ALTER TABLE "AiKnowledgeDocument" ADD COLUMN "enterpriseId" TEXT;
ALTER TABLE "AiKnowledgeDocument" ADD COLUMN "securityFindings" JSONB;
ALTER TABLE "AiKnowledgeDocument" ADD COLUMN "securityScannedAt" TIMESTAMP(3);
ALTER TABLE "AiVectorDocument" ADD COLUMN "enterpriseId" TEXT;
ALTER TABLE "AiDocumentJob" ADD COLUMN "enterpriseId" TEXT;
ALTER TABLE "AiApiKey" ADD COLUMN "enterpriseId" TEXT;
ALTER TABLE "AiApiKey" ADD COLUMN "scopes" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "AiApiKey" ADD COLUMN "expiresAt" TIMESTAMP(3);
ALTER TABLE "AiAssistantUsageLog" ADD COLUMN "enterpriseId" TEXT;
ALTER TABLE "AuditLog" ADD COLUMN "enterpriseId" TEXT;
ALTER TABLE "AuditLog" ADD COLUMN "ipHash" TEXT;

UPDATE "Membership" AS "resource"
SET "enterpriseId" = "organization"."enterpriseId",
    "departmentId" = CONCAT('department-', "resource"."organizationId")
FROM "Organization" AS "organization"
WHERE "resource"."organizationId" = "organization"."id";

UPDATE "Workspace" AS "resource"
SET "enterpriseId" = "organization"."enterpriseId",
    "departmentId" = CONCAT('department-', "resource"."organizationId")
FROM "Organization" AS "organization"
WHERE "resource"."organizationId" = "organization"."id";

UPDATE "WorkspaceProject" AS "resource"
SET "enterpriseId" = "organization"."enterpriseId"
FROM "Organization" AS "organization"
WHERE "resource"."organizationId" = "organization"."id";

UPDATE "ProjectTask" AS "resource"
SET "enterpriseId" = "organization"."enterpriseId"
FROM "Organization" AS "organization"
WHERE "resource"."organizationId" = "organization"."id";

UPDATE "ProjectActivity" AS "resource"
SET "enterpriseId" = "organization"."enterpriseId"
FROM "Organization" AS "organization"
WHERE "resource"."organizationId" = "organization"."id";

UPDATE "ProjectDocument" AS "resource"
SET "enterpriseId" = "organization"."enterpriseId"
FROM "Organization" AS "organization"
WHERE "resource"."organizationId" = "organization"."id";

UPDATE "WorkspaceKnowledgeDocument" AS "resource"
SET "enterpriseId" = "organization"."enterpriseId"
FROM "Organization" AS "organization"
WHERE "resource"."organizationId" = "organization"."id";

UPDATE "WorkspaceKnowledgeEmbedding" AS "resource"
SET "enterpriseId" = "organization"."enterpriseId"
FROM "Organization" AS "organization"
WHERE "resource"."organizationId" = "organization"."id";

UPDATE "AiWorkspace" AS "resource"
SET "enterpriseId" = "organization"."enterpriseId"
FROM "Organization" AS "organization"
WHERE "resource"."organizationId" = "organization"."id";

UPDATE "AiAssistant" AS "resource"
SET "enterpriseId" = "organization"."enterpriseId"
FROM "Organization" AS "organization"
WHERE "resource"."organizationId" = "organization"."id";

UPDATE "AiKnowledgeDocument" AS "resource"
SET "enterpriseId" = "organization"."enterpriseId"
FROM "Organization" AS "organization"
WHERE "resource"."organizationId" = "organization"."id";

UPDATE "AiVectorDocument" AS "resource"
SET "enterpriseId" = "organization"."enterpriseId"
FROM "Organization" AS "organization"
WHERE "resource"."organizationId" = "organization"."id";

UPDATE "AiDocumentJob" AS "resource"
SET "enterpriseId" = "organization"."enterpriseId"
FROM "Organization" AS "organization"
WHERE "resource"."organizationId" = "organization"."id";

UPDATE "AiApiKey" AS "resource"
SET "enterpriseId" = "organization"."enterpriseId"
FROM "Organization" AS "organization"
WHERE "resource"."organizationId" = "organization"."id";

UPDATE "AiAssistantUsageLog" AS "resource"
SET "enterpriseId" = "organization"."enterpriseId"
FROM "Organization" AS "organization"
WHERE "resource"."organizationId" = "organization"."id";

UPDATE "AuditLog" AS "resource"
SET "enterpriseId" = "organization"."enterpriseId"
FROM "Organization" AS "organization"
WHERE "resource"."organizationId" = "organization"."id";

ALTER TABLE "Organization" ALTER COLUMN "enterpriseId" SET NOT NULL;
ALTER TABLE "Membership" ALTER COLUMN "enterpriseId" SET NOT NULL;
ALTER TABLE "Membership" ALTER COLUMN "departmentId" SET NOT NULL;
ALTER TABLE "Workspace" ALTER COLUMN "enterpriseId" SET NOT NULL;
ALTER TABLE "Workspace" ALTER COLUMN "departmentId" SET NOT NULL;
ALTER TABLE "WorkspaceProject" ALTER COLUMN "enterpriseId" SET NOT NULL;
ALTER TABLE "ProjectTask" ALTER COLUMN "enterpriseId" SET NOT NULL;
ALTER TABLE "ProjectActivity" ALTER COLUMN "enterpriseId" SET NOT NULL;
ALTER TABLE "ProjectDocument" ALTER COLUMN "enterpriseId" SET NOT NULL;
ALTER TABLE "WorkspaceKnowledgeDocument" ALTER COLUMN "enterpriseId" SET NOT NULL;
ALTER TABLE "WorkspaceKnowledgeEmbedding" ALTER COLUMN "enterpriseId" SET NOT NULL;
ALTER TABLE "AiWorkspace" ALTER COLUMN "enterpriseId" SET NOT NULL;
ALTER TABLE "AiAssistant" ALTER COLUMN "enterpriseId" SET NOT NULL;
ALTER TABLE "AiKnowledgeDocument" ALTER COLUMN "enterpriseId" SET NOT NULL;
ALTER TABLE "AiVectorDocument" ALTER COLUMN "enterpriseId" SET NOT NULL;
ALTER TABLE "AiDocumentJob" ALTER COLUMN "enterpriseId" SET NOT NULL;
ALTER TABLE "AiApiKey" ALTER COLUMN "enterpriseId" SET NOT NULL;
ALTER TABLE "AiAssistantUsageLog" ALTER COLUMN "enterpriseId" SET NOT NULL;
ALTER TABLE "AuditLog" ALTER COLUMN "enterpriseId" SET NOT NULL;

CREATE TABLE "EnterpriseDomain" (
  "id" TEXT NOT NULL,
  "enterpriseId" TEXT NOT NULL,
  "domain" TEXT NOT NULL,
  "verificationToken" TEXT NOT NULL,
  "verifiedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "EnterpriseDomain_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SSOConnection" (
  "id" TEXT NOT NULL,
  "enterpriseId" TEXT NOT NULL,
  "provider" "EnterpriseSsoProvider" NOT NULL,
  "metadata" JSONB NOT NULL,
  "secretReference" TEXT,
  "enabled" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "SSOConnection_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "EnterpriseSecurityPolicy" (
  "id" TEXT NOT NULL,
  "enterpriseId" TEXT NOT NULL,
  "requireSso" BOOLEAN NOT NULL DEFAULT false,
  "requireMfa" BOOLEAN NOT NULL DEFAULT false,
  "allowPersonalApiKeys" BOOLEAN NOT NULL DEFAULT false,
  "sensitiveDataScanning" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "EnterpriseSecurityPolicy_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ResourcePermissionGrant" (
  "id" TEXT NOT NULL,
  "enterpriseId" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "membershipId" TEXT NOT NULL,
  "permissionId" TEXT NOT NULL,
  "resourceType" TEXT NOT NULL,
  "resourceId" TEXT NOT NULL,
  "createdByMembershipId" TEXT,
  "expiresAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ResourcePermissionGrant_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Department_organizationId_name_key" ON "Department"("organizationId", "name");
CREATE INDEX "Department_enterpriseId_createdAt_idx" ON "Department"("enterpriseId", "createdAt");
CREATE INDEX "Enterprise_status_createdAt_idx" ON "Enterprise"("status", "createdAt");
CREATE UNIQUE INDEX "EnterpriseDomain_domain_key" ON "EnterpriseDomain"("domain");
CREATE INDEX "EnterpriseDomain_enterpriseId_verifiedAt_idx" ON "EnterpriseDomain"("enterpriseId", "verifiedAt");
CREATE INDEX "SSOConnection_enterpriseId_enabled_createdAt_idx" ON "SSOConnection"("enterpriseId", "enabled", "createdAt");
CREATE UNIQUE INDEX "EnterpriseSecurityPolicy_enterpriseId_key" ON "EnterpriseSecurityPolicy"("enterpriseId");
CREATE INDEX "Organization_enterpriseId_createdAt_idx" ON "Organization"("enterpriseId", "createdAt");
CREATE INDEX "Membership_enterpriseId_organizationId_status_idx" ON "Membership"("enterpriseId", "organizationId", "status");
CREATE INDEX "Membership_departmentId_createdAt_idx" ON "Membership"("departmentId", "createdAt");
CREATE INDEX "Workspace_enterpriseId_organizationId_createdAt_idx" ON "Workspace"("enterpriseId", "organizationId", "createdAt");
CREATE INDEX "Workspace_departmentId_createdAt_idx" ON "Workspace"("departmentId", "createdAt");
CREATE INDEX "WorkspaceProject_enterpriseId_organizationId_updatedAt_idx" ON "WorkspaceProject"("enterpriseId", "organizationId", "updatedAt");
CREATE INDEX "ProjectTask_enterpriseId_organizationId_status_updatedAt_idx" ON "ProjectTask"("enterpriseId", "organizationId", "status", "updatedAt");
CREATE INDEX "ProjectActivity_enterpriseId_organizationId_createdAt_idx" ON "ProjectActivity"("enterpriseId", "organizationId", "createdAt");
CREATE INDEX "ProjectDocument_enterpriseId_organizationId_createdAt_idx" ON "ProjectDocument"("enterpriseId", "organizationId", "createdAt");
CREATE INDEX "WorkspaceKnowledgeDocument_enterpriseId_organizationId_namespace_idx" ON "WorkspaceKnowledgeDocument"("enterpriseId", "organizationId", "namespace");
CREATE INDEX "WorkspaceKnowledgeEmbedding_enterpriseId_organizationId_namespace_idx" ON "WorkspaceKnowledgeEmbedding"("enterpriseId", "organizationId", "namespace");
CREATE INDEX "AiWorkspace_enterpriseId_organizationId_createdAt_idx" ON "AiWorkspace"("enterpriseId", "organizationId", "createdAt");
CREATE INDEX "AiAssistant_enterpriseId_organizationId_createdAt_idx" ON "AiAssistant"("enterpriseId", "organizationId", "createdAt");
CREATE INDEX "AiKnowledgeDocument_enterpriseId_organizationId_createdAt_idx" ON "AiKnowledgeDocument"("enterpriseId", "organizationId", "createdAt");
CREATE INDEX "AiVectorDocument_enterpriseId_organizationId_workspaceId_createdAt_idx" ON "AiVectorDocument"("enterpriseId", "organizationId", "workspaceId", "createdAt");
CREATE INDEX "AiDocumentJob_enterpriseId_organizationId_workspaceId_createdAt_idx" ON "AiDocumentJob"("enterpriseId", "organizationId", "workspaceId", "createdAt");
CREATE INDEX "AiApiKey_enterpriseId_organizationId_createdAt_idx" ON "AiApiKey"("enterpriseId", "organizationId", "createdAt");
CREATE INDEX "AiAssistantUsageLog_enterpriseId_organizationId_createdAt_idx" ON "AiAssistantUsageLog"("enterpriseId", "organizationId", "createdAt");
CREATE INDEX "AuditLog_enterpriseId_organizationId_createdAt_idx" ON "AuditLog"("enterpriseId", "organizationId", "createdAt");
CREATE UNIQUE INDEX "ResourcePermissionGrant_membershipId_permissionId_resourceType_resourceId_key" ON "ResourcePermissionGrant"("membershipId", "permissionId", "resourceType", "resourceId");
CREATE INDEX "ResourcePermissionGrant_enterpriseId_organizationId_resourceType_resourceId_idx" ON "ResourcePermissionGrant"("enterpriseId", "organizationId", "resourceType", "resourceId");
CREATE INDEX "ResourcePermissionGrant_membershipId_expiresAt_idx" ON "ResourcePermissionGrant"("membershipId", "expiresAt");

ALTER TABLE "Organization" ADD CONSTRAINT "Organization_enterpriseId_fkey"
  FOREIGN KEY ("enterpriseId") REFERENCES "Enterprise"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Department" ADD CONSTRAINT "Department_enterpriseId_fkey"
  FOREIGN KEY ("enterpriseId") REFERENCES "Enterprise"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Department" ADD CONSTRAINT "Department_organizationId_fkey"
  FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Membership" ADD CONSTRAINT "Membership_enterpriseId_fkey"
  FOREIGN KEY ("enterpriseId") REFERENCES "Enterprise"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Membership" ADD CONSTRAINT "Membership_departmentId_fkey"
  FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Workspace" ADD CONSTRAINT "Workspace_enterpriseId_fkey"
  FOREIGN KEY ("enterpriseId") REFERENCES "Enterprise"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Workspace" ADD CONSTRAINT "Workspace_departmentId_fkey"
  FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "WorkspaceProject" ADD CONSTRAINT "WorkspaceProject_enterpriseId_fkey"
  FOREIGN KEY ("enterpriseId") REFERENCES "Enterprise"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProjectTask" ADD CONSTRAINT "ProjectTask_enterpriseId_fkey"
  FOREIGN KEY ("enterpriseId") REFERENCES "Enterprise"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProjectActivity" ADD CONSTRAINT "ProjectActivity_enterpriseId_fkey"
  FOREIGN KEY ("enterpriseId") REFERENCES "Enterprise"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProjectDocument" ADD CONSTRAINT "ProjectDocument_enterpriseId_fkey"
  FOREIGN KEY ("enterpriseId") REFERENCES "Enterprise"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "WorkspaceKnowledgeDocument" ADD CONSTRAINT "WorkspaceKnowledgeDocument_enterpriseId_fkey"
  FOREIGN KEY ("enterpriseId") REFERENCES "Enterprise"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "WorkspaceKnowledgeEmbedding" ADD CONSTRAINT "WorkspaceKnowledgeEmbedding_enterpriseId_fkey"
  FOREIGN KEY ("enterpriseId") REFERENCES "Enterprise"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AiWorkspace" ADD CONSTRAINT "AiWorkspace_enterpriseId_fkey"
  FOREIGN KEY ("enterpriseId") REFERENCES "Enterprise"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AiAssistant" ADD CONSTRAINT "AiAssistant_enterpriseId_fkey"
  FOREIGN KEY ("enterpriseId") REFERENCES "Enterprise"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AiKnowledgeDocument" ADD CONSTRAINT "AiKnowledgeDocument_enterpriseId_fkey"
  FOREIGN KEY ("enterpriseId") REFERENCES "Enterprise"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AiVectorDocument" ADD CONSTRAINT "AiVectorDocument_enterpriseId_fkey"
  FOREIGN KEY ("enterpriseId") REFERENCES "Enterprise"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AiDocumentJob" ADD CONSTRAINT "AiDocumentJob_enterpriseId_fkey"
  FOREIGN KEY ("enterpriseId") REFERENCES "Enterprise"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AiApiKey" ADD CONSTRAINT "AiApiKey_enterpriseId_fkey"
  FOREIGN KEY ("enterpriseId") REFERENCES "Enterprise"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AiAssistantUsageLog" ADD CONSTRAINT "AiAssistantUsageLog_enterpriseId_fkey"
  FOREIGN KEY ("enterpriseId") REFERENCES "Enterprise"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_enterpriseId_fkey"
  FOREIGN KEY ("enterpriseId") REFERENCES "Enterprise"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EnterpriseDomain" ADD CONSTRAINT "EnterpriseDomain_enterpriseId_fkey"
  FOREIGN KEY ("enterpriseId") REFERENCES "Enterprise"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SSOConnection" ADD CONSTRAINT "SSOConnection_enterpriseId_fkey"
  FOREIGN KEY ("enterpriseId") REFERENCES "Enterprise"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EnterpriseSecurityPolicy" ADD CONSTRAINT "EnterpriseSecurityPolicy_enterpriseId_fkey"
  FOREIGN KEY ("enterpriseId") REFERENCES "Enterprise"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ResourcePermissionGrant" ADD CONSTRAINT "ResourcePermissionGrant_enterpriseId_fkey"
  FOREIGN KEY ("enterpriseId") REFERENCES "Enterprise"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ResourcePermissionGrant" ADD CONSTRAINT "ResourcePermissionGrant_organizationId_fkey"
  FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ResourcePermissionGrant" ADD CONSTRAINT "ResourcePermissionGrant_membershipId_fkey"
  FOREIGN KEY ("membershipId") REFERENCES "Membership"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ResourcePermissionGrant" ADD CONSTRAINT "ResourcePermissionGrant_permissionId_fkey"
  FOREIGN KEY ("permissionId") REFERENCES "Permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ResourcePermissionGrant" ADD CONSTRAINT "ResourcePermissionGrant_createdByMembershipId_fkey"
  FOREIGN KEY ("createdByMembershipId") REFERENCES "Membership"("id") ON DELETE SET NULL ON UPDATE CASCADE;
