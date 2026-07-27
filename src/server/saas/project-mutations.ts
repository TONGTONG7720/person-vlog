import type { ProjectActivityType } from '@/generated/prisma/client';
import { requireCmsDatabase } from '@/server/cms/database';
import type { SaasContext } from '@/server/saas/auth';

type ProjectMutationInput = Readonly<{
  readonly action: string;
  readonly activityType: ProjectActivityType;
  readonly content: string;
  readonly context: SaasContext;
  readonly projectId: string;
}>;

export async function recordProjectMutation(input: ProjectMutationInput): Promise<void> {
  const database = requireCmsDatabase();

  await Promise.all([
    database.auditLog.create({
      data: {
        action: input.action,
        enterpriseId: input.context.enterprise.id,
        organizationId: input.context.organization.id,
        resource: 'workspace_project',
        resourceId: input.projectId,
        userId: input.context.user.id,
      },
    }),
    database.projectActivity.create({
      data: {
        actorMembershipId: input.context.membership.id,
        content: input.content,
        enterpriseId: input.context.enterprise.id,
        organizationId: input.context.organization.id,
        projectId: input.projectId,
        type: input.activityType,
      },
    }),
  ]);
}
