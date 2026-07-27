import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

import { requireAdminSession } from '@/server/cms/auth';
import { requireCmsDatabase } from '@/server/cms/database';

const adminResourceIdSchema = z.string().trim().min(1).max(64);

export async function getAdminActionContext(): Promise<
  Readonly<{
    readonly database: ReturnType<typeof requireCmsDatabase>;
    readonly session: Awaited<ReturnType<typeof requireAdminSession>>;
  }>
> {
  const session = await requireAdminSession();
  const database = requireCmsDatabase();

  return { database, session };
}

export function getAdminResourceId(formData: FormData): string | undefined {
  const parsed = adminResourceIdSchema.safeParse(formData.get('id'));

  return parsed.success ? parsed.data : undefined;
}

export function refreshAdminResource(path: string): void {
  revalidatePath(path);
  revalidatePath('/admin/dashboard');
}

export function redirectToAdminResource(path: string, state: 'error' | 'success'): never {
  redirect(`${path}?${state}=1`);
}
