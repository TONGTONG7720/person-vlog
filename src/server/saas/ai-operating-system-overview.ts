import { getCmsDatabase } from '@/server/cms/database';
import { requireSaasPermission, type SaasContext } from '@/server/saas/auth';
import { saasPermissions } from '@/server/saas/rbac';

export async function getAiOperatingSystemOverview(context: SaasContext) {
  requireSaasPermission(context, saasPermissions.agentRead);
  const database = getCmsDatabase();

  if (database === undefined) {
    return undefined;
  }

  const tenantWhere = {
    enterpriseId: context.enterprise.id,
    organizationId: context.organization.id,
  };
  const [
    workspaces,
    agents,
    employees,
    workflows,
    tools,
    knowledgeEntityCount,
    knowledgeRelationCount,
    taskRuns,
    approvals,
    reports,
    traces,
    usage,
    governance,
  ] = await Promise.all([
    database.aiWorkspace.findMany({
      orderBy: { updatedAt: 'desc' },
      select: { id: true, name: true, slug: true },
      where: tenantWhere,
    }),
    database.aiAgent.findMany({
      orderBy: [{ enabled: 'desc' }, { role: 'asc' }],
      select: {
        enabled: true,
        id: true,
        name: true,
        role: true,
        workspace: { select: { name: true } },
      },
      take: 20,
      where: tenantWhere,
    }),
    database.aiEmployee.findMany({
      orderBy: [{ status: 'asc' }, { name: 'asc' }],
      select: { department: true, name: true, status: true, workspace: { select: { name: true } } },
      take: 20,
      where: tenantWhere,
    }),
    database.aiWorkflow.findMany({
      orderBy: { updatedAt: 'desc' },
      select: {
        enabled: true,
        id: true,
        name: true,
        nodes: true,
        workspace: { select: { name: true } },
      },
      take: 20,
      where: tenantWhere,
    }),
    database.aiTool.findMany({
      orderBy: { key: 'asc' },
      select: { enabled: true, key: true, requiredPermission: true, riskLevel: true },
      take: 30,
      where: tenantWhere,
    }),
    database.aiKnowledgeEntity.count({ where: tenantWhere }),
    database.aiKnowledgeRelation.count({ where: tenantWhere }),
    database.aiTaskRun.findMany({
      include: { _count: { select: { approvals: true } }, workflow: { select: { name: true } } },
      orderBy: { queuedAt: 'desc' },
      take: 16,
      where: tenantWhere,
    }),
    database.aiApprovalRequest.findMany({
      include: { taskRun: { select: { requestSummary: true } } },
      orderBy: { requestedAt: 'desc' },
      take: 12,
      where: tenantWhere,
    }),
    database.aiReport.findMany({
      orderBy: { createdAt: 'desc' },
      select: { createdAt: true, id: true, title: true, workspace: { select: { name: true } } },
      take: 12,
      where: tenantWhere,
    }),
    database.aiTaskTrace.findMany({
      include: { agent: { select: { name: true } }, taskRun: { select: { requestSummary: true } } },
      orderBy: { createdAt: 'desc' },
      take: 18,
      where: tenantWhere,
    }),
    database.aiAssistantUsageLog.aggregate({
      _count: { _all: true },
      _sum: { costMicros: true, inputTokens: true, outputTokens: true },
      where: tenantWhere,
    }),
    database.aiGovernancePolicy.findUnique({
      where: { organizationId: context.organization.id },
    }),
  ]);

  return {
    agents,
    approvals,
    employees,
    governance,
    knowledge: { entityCount: knowledgeEntityCount, relationCount: knowledgeRelationCount },
    reports,
    taskRuns,
    tools,
    traces,
    usage: {
      costMicros: usage._sum.costMicros ?? 0,
      requestCount: usage._count._all,
      tokenCount: (usage._sum.inputTokens ?? 0) + (usage._sum.outputTokens ?? 0),
    },
    workflows: workflows.map((workflow) => ({
      enabled: workflow.enabled,
      id: workflow.id,
      name: workflow.name,
      nodeLabels: getWorkflowNodeLabels(workflow.nodes),
      nodeCount: Array.isArray(workflow.nodes) ? workflow.nodes.length : 0,
      workspaceName: workflow.workspace.name,
    })),
    workspaces,
  };
}

function getWorkflowNodeLabels(nodes: unknown): readonly string[] {
  if (!Array.isArray(nodes)) {
    return [];
  }

  return nodes.flatMap((node) => {
    if (typeof node !== 'object' || node === null || !('label' in node)) {
      return [];
    }

    return typeof node.label === 'string' ? [node.label] : [];
  });
}

export async function getAiOperatingSystemAdminOverview() {
  const database = getCmsDatabase();

  if (database === undefined) {
    return undefined;
  }

  const [agents, workflows, tasks, approvals, reports, policies, models, traces] =
    await Promise.all([
      database.aiAgent.count({ where: { enabled: true } }),
      database.aiWorkflow.count({ where: { enabled: true } }),
      database.aiTaskRun.groupBy({ _count: { _all: true }, by: ['status'] }),
      database.aiApprovalRequest.groupBy({ _count: { _all: true }, by: ['status'] }),
      database.aiReport.count(),
      database.aiGovernancePolicy.count(),
      database.aiModelConfig.findMany({
        orderBy: [{ enabled: 'desc' }, { priority: 'asc' }],
        select: { enabled: true, model: true, provider: true },
        take: 12,
      }),
      database.aiTaskTrace.findMany({
        include: {
          organization: { select: { name: true } },
          taskRun: { select: { requestSummary: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 12,
      }),
    ]);

  return { agents, approvals, models, policies, reports, tasks, traces, workflows };
}
