-- Stage 30: tenant-scoped Enterprise AI Operating System.

CREATE TYPE "AiOperatingAgentRole" AS ENUM ('PLANNER', 'RESEARCH', 'DATA', 'WRITER', 'ACTION');
CREATE TYPE "AiAgentMemoryType" AS ENUM ('SHORT_TERM', 'LONG_TERM');
CREATE TYPE "AiWorkflowRunStatus" AS ENUM ('QUEUED', 'RUNNING', 'AWAITING_APPROVAL', 'APPROVED', 'COMPLETED', 'FAILED');
CREATE TYPE "AiEmployeeStatus" AS ENUM ('ACTIVE', 'PAUSED', 'ARCHIVED');
CREATE TYPE "AiToolRiskLevel" AS ENUM ('READ', 'WRITE', 'HIGH');
CREATE TYPE "AiApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'EXECUTED', 'EXPIRED');
CREATE TYPE "AiTraceEventType" AS ENUM ('TASK_QUEUED', 'AGENT_STARTED', 'AGENT_COMPLETED', 'TOOL_CALLED', 'APPROVAL_REQUIRED', 'APPROVAL_RESOLVED', 'TASK_COMPLETED', 'TASK_FAILED');

CREATE TABLE "AiAgent" (
  "id" TEXT NOT NULL,
  "enterpriseId" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "role" "AiOperatingAgentRole" NOT NULL,
  "systemPrompt" TEXT NOT NULL,
  "tools" JSONB NOT NULL,
  "enabled" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AiAgent_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AiAgentMemory" (
  "id" TEXT NOT NULL,
  "enterpriseId" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "agentId" TEXT NOT NULL,
  "type" "AiAgentMemoryType" NOT NULL,
  "content" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AiAgentMemory_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AiKnowledgeEntity" (
  "id" TEXT NOT NULL,
  "enterpriseId" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "metadata" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AiKnowledgeEntity_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AiKnowledgeRelation" (
  "id" TEXT NOT NULL,
  "enterpriseId" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "sourceId" TEXT NOT NULL,
  "targetId" TEXT NOT NULL,
  "relation" TEXT NOT NULL,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AiKnowledgeRelation_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AiWorkflow" (
  "id" TEXT NOT NULL,
  "enterpriseId" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "nodes" JSONB NOT NULL,
  "enabled" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AiWorkflow_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AiEmployee" (
  "id" TEXT NOT NULL,
  "enterpriseId" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "agentId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "department" TEXT NOT NULL,
  "description" TEXT,
  "status" "AiEmployeeStatus" NOT NULL DEFAULT 'ACTIVE',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AiEmployee_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AiTool" (
  "id" TEXT NOT NULL,
  "enterpriseId" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "key" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "schema" JSONB NOT NULL,
  "requiredPermission" TEXT NOT NULL,
  "riskLevel" "AiToolRiskLevel" NOT NULL,
  "enabled" BOOLEAN NOT NULL DEFAULT true,
  "builtin" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AiTool_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AiTaskRun" (
  "id" TEXT NOT NULL,
  "enterpriseId" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "workflowId" TEXT,
  "requestedByMembershipId" TEXT,
  "requestSummary" TEXT NOT NULL,
  "agentPlan" JSONB NOT NULL,
  "toolKey" TEXT,
  "status" "AiWorkflowRunStatus" NOT NULL DEFAULT 'QUEUED',
  "outputSummary" TEXT,
  "queuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "startedAt" TIMESTAMP(3),
  "completedAt" TIMESTAMP(3),
  CONSTRAINT "AiTaskRun_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AiApprovalRequest" (
  "id" TEXT NOT NULL,
  "enterpriseId" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "taskRunId" TEXT NOT NULL,
  "reviewedByMembershipId" TEXT,
  "toolKey" TEXT NOT NULL,
  "status" "AiApprovalStatus" NOT NULL DEFAULT 'PENDING',
  "payload" JSONB NOT NULL,
  "decisionNote" TEXT,
  "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "reviewedAt" TIMESTAMP(3),
  "executedAt" TIMESTAMP(3),
  CONSTRAINT "AiApprovalRequest_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AiTaskTrace" (
  "id" TEXT NOT NULL,
  "enterpriseId" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "taskRunId" TEXT NOT NULL,
  "agentId" TEXT,
  "event" "AiTraceEventType" NOT NULL,
  "toolKey" TEXT,
  "payload" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AiTaskTrace_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AiReport" (
  "id" TEXT NOT NULL,
  "enterpriseId" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "taskRunId" TEXT,
  "title" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "format" TEXT NOT NULL DEFAULT 'MARKDOWN',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AiReport_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AiGovernancePolicy" (
  "id" TEXT NOT NULL,
  "enterpriseId" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "allowedModels" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "enabledAgentRoles" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "enabledToolKeys" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "requireHumanApproval" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AiGovernancePolicy_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "AiAgent_workspaceId_name_key" ON "AiAgent"("workspaceId", "name");
CREATE INDEX "AiAgent_enterpriseId_organizationId_workspaceId_enabled_idx" ON "AiAgent"("enterpriseId", "organizationId", "workspaceId", "enabled");
CREATE INDEX "AiAgent_workspaceId_role_enabled_idx" ON "AiAgent"("workspaceId", "role", "enabled");
CREATE INDEX "AiAgentMemory_enterpriseId_organizationId_workspaceId_createdAt_idx" ON "AiAgentMemory"("enterpriseId", "organizationId", "workspaceId", "createdAt");
CREATE INDEX "AiAgentMemory_agentId_type_createdAt_idx" ON "AiAgentMemory"("agentId", "type", "createdAt");
CREATE UNIQUE INDEX "AiKnowledgeEntity_workspaceId_type_name_key" ON "AiKnowledgeEntity"("workspaceId", "type", "name");
CREATE INDEX "AiKnowledgeEntity_enterpriseId_organizationId_workspaceId_type_idx" ON "AiKnowledgeEntity"("enterpriseId", "organizationId", "workspaceId", "type");
CREATE UNIQUE INDEX "AiKnowledgeRelation_sourceId_targetId_relation_key" ON "AiKnowledgeRelation"("sourceId", "targetId", "relation");
CREATE INDEX "AiKnowledgeRelation_enterpriseId_organizationId_workspaceId_createdAt_idx" ON "AiKnowledgeRelation"("enterpriseId", "organizationId", "workspaceId", "createdAt");
CREATE INDEX "AiKnowledgeRelation_sourceId_createdAt_idx" ON "AiKnowledgeRelation"("sourceId", "createdAt");
CREATE INDEX "AiKnowledgeRelation_targetId_createdAt_idx" ON "AiKnowledgeRelation"("targetId", "createdAt");
CREATE UNIQUE INDEX "AiWorkflow_workspaceId_name_key" ON "AiWorkflow"("workspaceId", "name");
CREATE INDEX "AiWorkflow_enterpriseId_organizationId_workspaceId_enabled_idx" ON "AiWorkflow"("enterpriseId", "organizationId", "workspaceId", "enabled");
CREATE UNIQUE INDEX "AiEmployee_workspaceId_name_key" ON "AiEmployee"("workspaceId", "name");
CREATE INDEX "AiEmployee_enterpriseId_organizationId_workspaceId_status_idx" ON "AiEmployee"("enterpriseId", "organizationId", "workspaceId", "status");
CREATE INDEX "AiEmployee_agentId_status_idx" ON "AiEmployee"("agentId", "status");
CREATE UNIQUE INDEX "AiTool_workspaceId_key_key" ON "AiTool"("workspaceId", "key");
CREATE INDEX "AiTool_enterpriseId_organizationId_workspaceId_enabled_idx" ON "AiTool"("enterpriseId", "organizationId", "workspaceId", "enabled");
CREATE INDEX "AiTaskRun_enterpriseId_organizationId_workspaceId_status_queuedAt_idx" ON "AiTaskRun"("enterpriseId", "organizationId", "workspaceId", "status", "queuedAt");
CREATE INDEX "AiTaskRun_workflowId_queuedAt_idx" ON "AiTaskRun"("workflowId", "queuedAt");
CREATE INDEX "AiApprovalRequest_enterpriseId_organizationId_workspaceId_status_requestedAt_idx" ON "AiApprovalRequest"("enterpriseId", "organizationId", "workspaceId", "status", "requestedAt");
CREATE INDEX "AiApprovalRequest_taskRunId_status_idx" ON "AiApprovalRequest"("taskRunId", "status");
CREATE INDEX "AiTaskTrace_enterpriseId_organizationId_workspaceId_createdAt_idx" ON "AiTaskTrace"("enterpriseId", "organizationId", "workspaceId", "createdAt");
CREATE INDEX "AiTaskTrace_taskRunId_createdAt_idx" ON "AiTaskTrace"("taskRunId", "createdAt");
CREATE INDEX "AiReport_enterpriseId_organizationId_workspaceId_createdAt_idx" ON "AiReport"("enterpriseId", "organizationId", "workspaceId", "createdAt");
CREATE INDEX "AiReport_taskRunId_createdAt_idx" ON "AiReport"("taskRunId", "createdAt");
CREATE UNIQUE INDEX "AiGovernancePolicy_organizationId_key" ON "AiGovernancePolicy"("organizationId");
CREATE INDEX "AiGovernancePolicy_enterpriseId_organizationId_idx" ON "AiGovernancePolicy"("enterpriseId", "organizationId");

ALTER TABLE "AiAgent" ADD CONSTRAINT "AiAgent_enterpriseId_fkey" FOREIGN KEY ("enterpriseId") REFERENCES "Enterprise"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AiAgent" ADD CONSTRAINT "AiAgent_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AiAgent" ADD CONSTRAINT "AiAgent_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "AiWorkspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AiAgentMemory" ADD CONSTRAINT "AiAgentMemory_enterpriseId_fkey" FOREIGN KEY ("enterpriseId") REFERENCES "Enterprise"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AiAgentMemory" ADD CONSTRAINT "AiAgentMemory_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AiAgentMemory" ADD CONSTRAINT "AiAgentMemory_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "AiWorkspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AiAgentMemory" ADD CONSTRAINT "AiAgentMemory_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "AiAgent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AiKnowledgeEntity" ADD CONSTRAINT "AiKnowledgeEntity_enterpriseId_fkey" FOREIGN KEY ("enterpriseId") REFERENCES "Enterprise"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AiKnowledgeEntity" ADD CONSTRAINT "AiKnowledgeEntity_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AiKnowledgeEntity" ADD CONSTRAINT "AiKnowledgeEntity_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "AiWorkspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AiKnowledgeRelation" ADD CONSTRAINT "AiKnowledgeRelation_enterpriseId_fkey" FOREIGN KEY ("enterpriseId") REFERENCES "Enterprise"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AiKnowledgeRelation" ADD CONSTRAINT "AiKnowledgeRelation_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AiKnowledgeRelation" ADD CONSTRAINT "AiKnowledgeRelation_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "AiWorkspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AiKnowledgeRelation" ADD CONSTRAINT "AiKnowledgeRelation_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "AiKnowledgeEntity"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AiKnowledgeRelation" ADD CONSTRAINT "AiKnowledgeRelation_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "AiKnowledgeEntity"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AiWorkflow" ADD CONSTRAINT "AiWorkflow_enterpriseId_fkey" FOREIGN KEY ("enterpriseId") REFERENCES "Enterprise"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AiWorkflow" ADD CONSTRAINT "AiWorkflow_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AiWorkflow" ADD CONSTRAINT "AiWorkflow_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "AiWorkspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AiEmployee" ADD CONSTRAINT "AiEmployee_enterpriseId_fkey" FOREIGN KEY ("enterpriseId") REFERENCES "Enterprise"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AiEmployee" ADD CONSTRAINT "AiEmployee_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AiEmployee" ADD CONSTRAINT "AiEmployee_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "AiWorkspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AiEmployee" ADD CONSTRAINT "AiEmployee_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "AiAgent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AiTool" ADD CONSTRAINT "AiTool_enterpriseId_fkey" FOREIGN KEY ("enterpriseId") REFERENCES "Enterprise"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AiTool" ADD CONSTRAINT "AiTool_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AiTool" ADD CONSTRAINT "AiTool_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "AiWorkspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AiTaskRun" ADD CONSTRAINT "AiTaskRun_enterpriseId_fkey" FOREIGN KEY ("enterpriseId") REFERENCES "Enterprise"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AiTaskRun" ADD CONSTRAINT "AiTaskRun_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AiTaskRun" ADD CONSTRAINT "AiTaskRun_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "AiWorkspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AiTaskRun" ADD CONSTRAINT "AiTaskRun_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "AiWorkflow"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AiTaskRun" ADD CONSTRAINT "AiTaskRun_requestedByMembershipId_fkey" FOREIGN KEY ("requestedByMembershipId") REFERENCES "Membership"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AiApprovalRequest" ADD CONSTRAINT "AiApprovalRequest_enterpriseId_fkey" FOREIGN KEY ("enterpriseId") REFERENCES "Enterprise"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AiApprovalRequest" ADD CONSTRAINT "AiApprovalRequest_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AiApprovalRequest" ADD CONSTRAINT "AiApprovalRequest_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "AiWorkspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AiApprovalRequest" ADD CONSTRAINT "AiApprovalRequest_taskRunId_fkey" FOREIGN KEY ("taskRunId") REFERENCES "AiTaskRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AiApprovalRequest" ADD CONSTRAINT "AiApprovalRequest_reviewedByMembershipId_fkey" FOREIGN KEY ("reviewedByMembershipId") REFERENCES "Membership"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AiTaskTrace" ADD CONSTRAINT "AiTaskTrace_enterpriseId_fkey" FOREIGN KEY ("enterpriseId") REFERENCES "Enterprise"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AiTaskTrace" ADD CONSTRAINT "AiTaskTrace_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AiTaskTrace" ADD CONSTRAINT "AiTaskTrace_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "AiWorkspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AiTaskTrace" ADD CONSTRAINT "AiTaskTrace_taskRunId_fkey" FOREIGN KEY ("taskRunId") REFERENCES "AiTaskRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AiTaskTrace" ADD CONSTRAINT "AiTaskTrace_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "AiAgent"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AiReport" ADD CONSTRAINT "AiReport_enterpriseId_fkey" FOREIGN KEY ("enterpriseId") REFERENCES "Enterprise"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AiReport" ADD CONSTRAINT "AiReport_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AiReport" ADD CONSTRAINT "AiReport_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "AiWorkspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AiReport" ADD CONSTRAINT "AiReport_taskRunId_fkey" FOREIGN KEY ("taskRunId") REFERENCES "AiTaskRun"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AiGovernancePolicy" ADD CONSTRAINT "AiGovernancePolicy_enterpriseId_fkey" FOREIGN KEY ("enterpriseId") REFERENCES "Enterprise"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AiGovernancePolicy" ADD CONSTRAINT "AiGovernancePolicy_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
