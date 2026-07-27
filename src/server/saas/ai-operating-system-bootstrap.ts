import {
  AiAgentMemoryType,
  AiEmployeeStatus,
  AiOperatingAgentRole,
  AiToolRiskLevel,
  type PrismaClient,
} from '@/generated/prisma/client';
import {
  aiOperatingSystemAgentDefinitions,
  aiOperatingSystemEmployeeDefinitions,
  createKnowledgeGraphSeed,
  defaultAiOperatingSystemWorkflowNodes,
} from '@/ai/operating-system/defaults';
import { aiAgentRoles, type AiAgentRole } from '@/ai/operating-system/contracts';
import { builtInAiTools } from '@/ai/tools/tool-registry';
import type { AiOperatingSystemTenantScope } from '@/server/saas/ai-operating-system-scope';
import { SaasResourceNotFoundError } from '@/server/saas/project-errors';

const agentRoleToPrisma = {
  action: AiOperatingAgentRole.ACTION,
  data: AiOperatingAgentRole.DATA,
  planner: AiOperatingAgentRole.PLANNER,
  research: AiOperatingAgentRole.RESEARCH,
  writer: AiOperatingAgentRole.WRITER,
} as const satisfies Readonly<Record<AiAgentRole, AiOperatingAgentRole>>;

const toolRiskToPrisma = {
  high: AiToolRiskLevel.HIGH,
  read: AiToolRiskLevel.READ,
  write: AiToolRiskLevel.WRITE,
} as const;

export async function ensureAiOperatingSystemDefaults(
  database: PrismaClient,
  tenant: AiOperatingSystemTenantScope,
  workspaceId: string,
): Promise<void> {
  const workspace = await database.aiWorkspace.findFirst({
    select: { id: true, name: true, organization: { select: { name: true } } },
    where: {
      enterpriseId: tenant.enterpriseId,
      id: workspaceId,
      organizationId: tenant.organizationId,
    },
  });

  if (workspace === null) {
    throw new SaasResourceNotFoundError();
  }

  const agentIdByRole = new Map<AiAgentRole, string>();

  for (const definition of aiOperatingSystemAgentDefinitions) {
    const agent = await database.aiAgent.upsert({
      create: {
        enabled: true,
        enterpriseId: tenant.enterpriseId,
        name: definition.name,
        organizationId: tenant.organizationId,
        role: agentRoleToPrisma[definition.role],
        systemPrompt: definition.systemPrompt,
        tools: { enabled: definition.toolKeys },
        workspaceId: workspace.id,
      },
      update: {
        enabled: true,
        role: agentRoleToPrisma[definition.role],
        systemPrompt: definition.systemPrompt,
        tools: { enabled: definition.toolKeys },
      },
      where: { workspaceId_name: { name: definition.name, workspaceId: workspace.id } },
    });
    agentIdByRole.set(definition.role, agent.id);

    const memory = await database.aiAgentMemory.findFirst({
      select: { id: true },
      where: { agentId: agent.id, type: AiAgentMemoryType.LONG_TERM },
    });

    if (memory === null) {
      await database.aiAgentMemory.create({
        data: {
          agentId: agent.id,
          content: `${definition.name} 仅在当前企业工作区的授权边界内工作。`,
          enterpriseId: tenant.enterpriseId,
          organizationId: tenant.organizationId,
          type: AiAgentMemoryType.LONG_TERM,
          workspaceId: workspace.id,
        },
      });
    }
  }

  for (const tool of builtInAiTools) {
    await database.aiTool.upsert({
      create: {
        builtin: true,
        description: tool.description,
        enabled: true,
        enterpriseId: tenant.enterpriseId,
        key: tool.key,
        name: tool.key,
        organizationId: tenant.organizationId,
        requiredPermission: tool.requiredPermission,
        riskLevel: toolRiskToPrisma[tool.riskLevel],
        schema: { input: 'json', version: 1 },
        workspaceId: workspace.id,
      },
      update: {
        description: tool.description,
        enabled: true,
        requiredPermission: tool.requiredPermission,
        riskLevel: toolRiskToPrisma[tool.riskLevel],
      },
      where: { workspaceId_key: { key: tool.key, workspaceId: workspace.id } },
    });
  }

  await database.aiWorkflow.upsert({
    create: {
      description: '从企业请求到 Agent 协作、审批与报告的默认 AIOS 工作流。',
      enabled: true,
      enterpriseId: tenant.enterpriseId,
      name: '企业 AI 任务处理',
      nodes: defaultAiOperatingSystemWorkflowNodes,
      organizationId: tenant.organizationId,
      workspaceId: workspace.id,
    },
    update: { enabled: true, nodes: defaultAiOperatingSystemWorkflowNodes },
    where: { workspaceId_name: { name: '企业 AI 任务处理', workspaceId: workspace.id } },
  });

  for (const definition of aiOperatingSystemEmployeeDefinitions) {
    const agentId = agentIdByRole.get(definition.role);

    if (agentId === undefined) {
      continue;
    }

    await database.aiEmployee.upsert({
      create: {
        agentId,
        department: definition.department,
        description: definition.description,
        enterpriseId: tenant.enterpriseId,
        name: definition.name,
        organizationId: tenant.organizationId,
        status: AiEmployeeStatus.ACTIVE,
        workspaceId: workspace.id,
      },
      update: {
        agentId,
        department: definition.department,
        description: definition.description,
        status: AiEmployeeStatus.ACTIVE,
      },
      where: { workspaceId_name: { name: definition.name, workspaceId: workspace.id } },
    });
  }

  const entities = createKnowledgeGraphSeed({
    organizationName: workspace.organization.name,
    workspaceName: workspace.name,
  });
  const entityIdByType = new Map<string, string>();

  for (const entity of entities) {
    const record = await database.aiKnowledgeEntity.upsert({
      create: {
        enterpriseId: tenant.enterpriseId,
        metadata: entity.metadata,
        name: entity.name,
        organizationId: tenant.organizationId,
        type: entity.type,
        workspaceId: workspace.id,
      },
      update: { metadata: entity.metadata },
      where: {
        workspaceId_type_name: { name: entity.name, type: entity.type, workspaceId: workspace.id },
      },
    });
    entityIdByType.set(entity.type, record.id);
  }

  const organizationEntityId = entityIdByType.get('organization');
  const workspaceEntityId = entityIdByType.get('workspace');

  if (organizationEntityId !== undefined && workspaceEntityId !== undefined) {
    await database.aiKnowledgeRelation.upsert({
      create: {
        enterpriseId: tenant.enterpriseId,
        organizationId: tenant.organizationId,
        relation: 'contains',
        sourceId: organizationEntityId,
        targetId: workspaceEntityId,
        workspaceId: workspace.id,
      },
      update: {},
      where: {
        sourceId_targetId_relation: {
          relation: 'contains',
          sourceId: organizationEntityId,
          targetId: workspaceEntityId,
        },
      },
    });
  }

  await database.aiGovernancePolicy.upsert({
    create: {
      allowedModels: [],
      enabledAgentRoles: [...aiAgentRoles],
      enabledToolKeys: builtInAiTools.map((tool) => tool.key),
      enterpriseId: tenant.enterpriseId,
      organizationId: tenant.organizationId,
      requireHumanApproval: true,
    },
    update: {},
    where: { organizationId: tenant.organizationId },
  });
}
