import { ProjectFileStorageProvider } from '@/generated/prisma/client';
import { getSaasApiContext, saasApiErrorResponse } from '@/server/saas/api';
import { requirePlanLimit } from '@/server/saas/billing/entitlements';
import { getOrganizationStoredBytes } from '@/server/saas/billing/usage';
import { storePrivateProjectFile } from '@/server/saas/file-storage';
import {
  assertSaasProjectFileAccess,
  createSaasProjectDocument,
} from '@/server/saas/project-documents';
import { projectFileSchema } from '@/server/saas/validation';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

type ProjectRouteContext = Readonly<{
  readonly params: Promise<Readonly<{ readonly id: string }>>;
}>;

export async function POST(
  request: Request,
  routeContext: ProjectRouteContext,
): Promise<NextResponse> {
  const contextResult = await getSaasApiContext(request);

  if (contextResult.kind === 'unauthorized') {
    return contextResult.response;
  }

  let formData: FormData;

  try {
    formData = await request.formData();
  } catch (error) {
    if (error instanceof TypeError) {
      return NextResponse.json({ message: '文件上传内容无法读取。' }, { status: 400 });
    }

    throw error;
  }

  const file = formData.get('file');

  if (!(file instanceof File)) {
    return NextResponse.json({ message: '请选择一个项目文件。' }, { status: 400 });
  }

  const parsed = projectFileSchema.safeParse({
    contentType: file.type,
    fileName: file.name,
    size: file.size,
  });

  if (!parsed.success) {
    return NextResponse.json({ message: '文件格式或大小不符合要求。' }, { status: 400 });
  }

  const { id } = await routeContext.params;

  try {
    await assertSaasProjectFileAccess(contextResult.context, id);
    const storedBytes = await getOrganizationStoredBytes(contextResult.context.organization.id);
    await requirePlanLimit(contextResult.context, 'storageBytes', storedBytes, file.size);
    const storedFile = await storePrivateProjectFile({
      enterpriseId: contextResult.context.enterprise.id,
      file,
      organizationId: contextResult.context.organization.id,
      projectId: id,
    });
    const document = await createSaasProjectDocument(contextResult.context, {
      contentType: storedFile.contentType,
      pathname: storedFile.pathname,
      projectId: id,
      size: storedFile.size,
      storageProvider: ProjectFileStorageProvider.VERCEL_BLOB,
      title: parsed.data.fileName,
    });

    return NextResponse.json({ document }, { status: 201 });
  } catch (error) {
    return saasApiErrorResponse(error);
  }
}
