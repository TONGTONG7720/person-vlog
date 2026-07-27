import {
  ProjectActivityType,
  ProjectDocumentKind,
  ProjectFileStorageProvider,
} from '@/generated/prisma/client';
import { requireCmsDatabase } from '@/server/cms/database';
import { requireSaasPermission, type SaasContext } from '@/server/saas/auth';
import { requirePlanFeature } from '@/server/saas/billing/entitlements';
import { SaasResourceNotFoundError } from '@/server/saas/project-errors';
import { recordProjectMutation } from '@/server/saas/project-mutations';
import { saasPermissions, tenantKnowledgeNamespace } from '@/server/saas/rbac';
import { tenantProjectWhere } from '@/server/saas/scoping';

type CreateSaasProjectDocumentInput = Readonly<{
  readonly content?: string;
  readonly contentType?: string;
  readonly pathname?: string;
  readonly projectId: string;
  readonly size?: number;
  readonly storageProvider?: ProjectFileStorageProvider;
  readonly title: string;
}>;

export async function createSaasProjectDocument(
  context: SaasContext,
  input: CreateSaasProjectDocumentInput,
) {
  const database = requireCmsDatabase();
  const project = await getSaasProjectDocumentTarget(context, input.projectId);

  if (input.content !== undefined) {
    await requirePlanFeature(context, 'privateKnowledge');
  }

  const document = await database.projectDocument.create({
    data: {
      ...(input.content === undefined ? {} : { content: input.content }),
      ...(input.contentType === undefined ? {} : { contentType: input.contentType }),
      ...(input.pathname === undefined ? {} : { pathname: input.pathname }),
      ...(input.size === undefined ? {} : { size: input.size }),
      ...(input.storageProvider === undefined ? {} : { storageProvider: input.storageProvider }),
      enterpriseId: context.enterprise.id,
      kind: input.pathname === undefined ? ProjectDocumentKind.MARKDOWN : ProjectDocumentKind.FILE,
      organizationId: context.organization.id,
      projectId: project.id,
      title: input.title,
      uploadedByMembershipId: context.membership.id,
      workspaceId: project.workspaceId,
    },
  });

  if (input.content !== undefined) {
    await database.workspaceKnowledgeDocument.upsert({
      create: {
        content: input.content,
        documentId: document.id,
        namespace: tenantKnowledgeNamespace({
          enterpriseId: context.enterprise.id,
          organizationId: context.organization.id,
          workspaceId: project.workspaceId,
        }),
        organizationId: context.organization.id,
        enterpriseId: context.enterprise.id,
        projectId: project.id,
        title: document.title,
        workspaceId: project.workspaceId,
      },
      update: { content: input.content, title: document.title },
      where: { documentId: document.id },
    });
  }

  await recordProjectMutation({
    action: input.pathname === undefined ? 'document.created' : 'file.uploaded',
    activityType:
      input.pathname === undefined
        ? ProjectActivityType.DOCUMENT_CREATED
        : ProjectActivityType.FILE_UPLOADED,
    content: `${input.pathname === undefined ? '创建文档' : '上传文件'}「${document.title}」`,
    context,
    projectId: project.id,
  });

  return document;
}

export async function assertSaasProjectFileAccess(
  context: SaasContext,
  projectId: string,
): Promise<void> {
  await getSaasProjectDocumentTarget(context, projectId);
}

export async function getSaasProjectFileDownload(
  context: SaasContext,
  projectId: string,
  documentId: string,
) {
  requireSaasPermission(context, saasPermissions.fileRead);
  const database = requireCmsDatabase();
  const project = await database.workspaceProject.findFirst({
    select: { id: true, workspaceId: true },
    where: tenantProjectWhere({
      enterpriseId: context.enterprise.id,
      organizationId: context.organization.id,
      projectId,
    }),
  });

  if (project === null) {
    throw new SaasResourceNotFoundError();
  }

  const document = await database.projectDocument.findFirst({
    select: { contentType: true, pathname: true, title: true },
    where: {
      enterpriseId: context.enterprise.id,
      id: documentId,
      organizationId: context.organization.id,
      projectId: project.id,
      workspaceId: project.workspaceId,
    },
  });

  if (document === null || document.pathname === null) {
    throw new SaasResourceNotFoundError();
  }

  return document;
}

async function getSaasProjectDocumentTarget(context: SaasContext, projectId: string) {
  requireSaasPermission(context, saasPermissions.fileWrite);
  const database = requireCmsDatabase();
  const project = await database.workspaceProject.findFirst({
    select: { id: true, workspaceId: true },
    where: tenantProjectWhere({
      enterpriseId: context.enterprise.id,
      organizationId: context.organization.id,
      projectId,
    }),
  });

  if (project === null) {
    throw new SaasResourceNotFoundError();
  }

  return project;
}
