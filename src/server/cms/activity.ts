import { requireCmsDatabase } from '@/server/cms/database';

export type AdminActivityInput = Readonly<{
  readonly action: string;
  readonly resource: string;
  readonly resourceId?: string;
  readonly summary: string;
}>;

export async function recordAdminActivity(input: AdminActivityInput): Promise<void> {
  const database = requireCmsDatabase();

  await database.adminActivity.create({
    data: {
      action: input.action,
      resource: input.resource,
      ...(input.resourceId === undefined ? {} : { resourceId: input.resourceId }),
      summary: input.summary,
    },
  });
}
