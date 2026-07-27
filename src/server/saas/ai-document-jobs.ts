import {
  AiDocumentJobStatus,
  AiDocumentSourceType,
  AiDocumentStatus,
  ProjectFileStorageProvider,
} from '@/generated/prisma/client';
import { chunkDocumentText } from '@/ai/document/chunker';
import {
  DocumentParseError,
  extractDocumentText,
  type SupportedAiDocumentSourceType,
} from '@/ai/document/parser';
import { writeEnterpriseAuditLog } from '@/server/enterprise/audit';
import { evaluateEnterpriseAiContent } from '@/server/enterprise/security-service';
import { requireCmsDatabase } from '@/server/cms/database';
import { requireSaasPermission, type SaasContext } from '@/server/saas/auth';
import { AiPlatformInputError } from '@/server/saas/ai-platform-errors';
import { requirePlanFeature, requirePlanLimit } from '@/server/saas/billing/entitlements';
import { getOrganizationStoredBytes } from '@/server/saas/billing/usage';
import {
  ProjectFileStorageError,
  readPrivateAiDocumentFile,
  storePrivateAiDocumentFile,
} from '@/server/saas/file-storage';
import { SaasResourceNotFoundError } from '@/server/saas/project-errors';
import { saasPermissions } from '@/server/saas/rbac';
import type { CreateAiTextDocumentInput } from '@/server/saas/validation';

type CreateSaasAiFileDocumentInput = Readonly<{
  readonly chunkOverlap: number;
  readonly chunkSize: number;
  readonly file: File;
  readonly roleKeys: readonly string[];
  readonly sourceType: SupportedAiDocumentSourceType;
  readonly title: string;
  readonly workspaceId: string;
}>;

type AiDocumentCreateInput = Readonly<{
  readonly chunkOverlap: number;
  readonly chunkSize: number;
  readonly content?: string;
  readonly contentType?: string;
  readonly pathname?: string;
  readonly roleKeys: readonly string[];
  readonly size?: number;
  readonly sourceType: AiDocumentSourceType;
  readonly storageProvider?: ProjectFileStorageProvider;
  readonly title: string;
  readonly workspaceId: string;
}>;

export async function getSaasAiDocuments(context: SaasContext, workspaceId?: string) {
  requireSaasPermission(context, saasPermissions.aiUse);
  const database = requireCmsDatabase();

  return database.aiKnowledgeDocument.findMany({
    include: {
      _count: { select: { chunks: true } },
      permissions: { select: { roleKey: true } },
    },
    orderBy: { updatedAt: 'desc' },
    take: 80,
    where: {
      enterpriseId: context.enterprise.id,
      organizationId: context.organization.id,
      ...(workspaceId === undefined ? {} : { workspaceId }),
      OR: [
        { permissions: { none: {} } },
        { permissions: { some: { roleKey: context.membership.role } } },
      ],
    },
  });
}

export async function createSaasAiTextDocument(
  context: SaasContext,
  input: CreateAiTextDocumentInput,
) {
  return createAiKnowledgeDocument(context, {
    chunkOverlap: input.chunkOverlap,
    chunkSize: input.chunkSize,
    content: input.content,
    contentType: input.sourceType === 'MARKDOWN' ? 'text/markdown' : 'text/plain',
    roleKeys: input.roleKeys,
    size: Buffer.byteLength(input.content, 'utf8'),
    sourceType:
      input.sourceType === 'MARKDOWN' ? AiDocumentSourceType.MARKDOWN : AiDocumentSourceType.TEXT,
    title: input.title,
    workspaceId: input.workspaceId,
  });
}

export async function createSaasAiFileDocument(
  context: SaasContext,
  input: CreateSaasAiFileDocumentInput,
) {
  requireSaasPermission(context, saasPermissions.aiManage);
  await requirePlanFeature(context, 'aiWorkspace');
  await assertAiWorkspaceExists(context, input.workspaceId);
  const storedBytes = await getOrganizationStoredBytes(context.organization.id);

  await requirePlanLimit(context, 'storageBytes', storedBytes, input.file.size);
  const stored = await storePrivateAiDocumentFile({
    enterpriseId: context.enterprise.id,
    file: input.file,
    organizationId: context.organization.id,
    workspaceId: input.workspaceId,
  });

  return createAiKnowledgeDocument(context, {
    chunkOverlap: input.chunkOverlap,
    chunkSize: input.chunkSize,
    contentType: stored.contentType,
    pathname: stored.pathname,
    roleKeys: input.roleKeys,
    size: stored.size,
    sourceType: toPrismaDocumentSourceType(input.sourceType),
    storageProvider: ProjectFileStorageProvider.VERCEL_BLOB,
    title: input.title,
    workspaceId: input.workspaceId,
  });
}

export async function processSaasAiDocument(context: SaasContext, documentId: string) {
  requireSaasPermission(context, saasPermissions.aiManage);
  const database = requireCmsDatabase();
  const document = await database.aiKnowledgeDocument.findFirst({
    select: {
      chunkOverlap: true,
      chunkSize: true,
      content: true,
      enterpriseId: true,
      id: true,
      organizationId: true,
      pathname: true,
      sourceType: true,
      title: true,
      workspaceId: true,
    },
    where: {
      enterpriseId: context.enterprise.id,
      id: documentId,
      organizationId: context.organization.id,
    },
  });

  if (document === null) {
    throw new SaasResourceNotFoundError();
  }

  const job = await database.aiDocumentJob.findFirst({
    orderBy: { createdAt: 'desc' },
    where: { documentId: document.id, enterpriseId: context.enterprise.id },
  });

  const activeJob =
    job === null
      ? await database.aiDocumentJob.create({
          data: {
            documentId: document.id,
            enterpriseId: document.enterpriseId,
            kind: 'PROCESS_DOCUMENT',
            organizationId: document.organizationId,
            workspaceId: document.workspaceId,
          },
        })
      : job;

  await database.$transaction([
    database.aiDocumentJob.update({
      data: {
        attempts: { increment: 1 },
        errorMessage: null,
        startedAt: new Date(),
        status: AiDocumentJobStatus.PROCESSING,
      },
      where: { id: activeJob.id },
    }),
    database.aiKnowledgeDocument.update({
      data: { errorMessage: null, status: AiDocumentStatus.PROCESSING },
      where: { id: document.id },
    }),
  ]);

  try {
    const content = await resolveAiDocumentText(document);

    if (content === '') {
      throw new DocumentParseError('文档没有可用于检索的文本。');
    }

    const safety = await evaluateEnterpriseAiContent(context, content);

    if (safety.status !== 'ALLOW') {
      await recordAiDocumentSecurityOutcome({
        context,
        documentId: document.id,
        findings: safety.findings,
        jobId: activeJob.id,
        status: safety.status,
      });

      return database.aiKnowledgeDocument.findFirst({
        include: { _count: { select: { chunks: true } } },
        where: {
          enterpriseId: context.enterprise.id,
          id: document.id,
          organizationId: context.organization.id,
        },
      });
    }

    const chunks = chunkDocumentText({
      chunkOverlap: document.chunkOverlap,
      chunkSize: document.chunkSize,
      content,
    });

    await database.$transaction(async (transaction) => {
      await transaction.aiVectorDocument.deleteMany({ where: { documentId: document.id } });

      if (chunks.length > 0) {
        await transaction.aiVectorDocument.createMany({
          data: chunks.map((chunk) => ({
            chunkIndex: chunk.index,
            content: chunk.content,
            documentId: document.id,
            enterpriseId: document.enterpriseId,
            metadata: { sourceType: document.sourceType, title: document.title },
            organizationId: document.organizationId,
            tokenCount: chunk.estimatedTokens,
            workspaceId: document.workspaceId,
          })),
        });
      }

      await transaction.aiKnowledgeDocument.update({
        data: {
          content,
          errorMessage: null,
          processedAt: new Date(),
          status: AiDocumentStatus.READY,
        },
        where: { id: document.id },
      });
      await transaction.aiDocumentJob.update({
        data: {
          completedAt: new Date(),
          errorMessage: null,
          status: AiDocumentJobStatus.COMPLETED,
        },
        where: { id: activeJob.id },
      });
    });
  } catch (error) {
    const message = getDocumentProcessingErrorMessage(error);

    await database.$transaction([
      database.aiKnowledgeDocument.update({
        data: { errorMessage: message, status: AiDocumentStatus.FAILED },
        where: { id: document.id },
      }),
      database.aiDocumentJob.update({
        data: {
          completedAt: new Date(),
          errorMessage: message,
          status: AiDocumentJobStatus.FAILED,
        },
        where: { id: activeJob.id },
      }),
    ]);
  }

  return database.aiKnowledgeDocument.findFirst({
    include: { _count: { select: { chunks: true } } },
    where: {
      enterpriseId: context.enterprise.id,
      id: document.id,
      organizationId: context.organization.id,
    },
  });
}

async function createAiKnowledgeDocument(context: SaasContext, input: AiDocumentCreateInput) {
  requireSaasPermission(context, saasPermissions.aiManage);
  await requirePlanFeature(context, 'aiWorkspace');
  const database = requireCmsDatabase();
  await assertAiWorkspaceExists(context, input.workspaceId);
  const documentCount = await database.aiKnowledgeDocument.count({
    where: { enterpriseId: context.enterprise.id, organizationId: context.organization.id },
  });

  await requirePlanLimit(context, 'aiDocuments', documentCount);
  const safety =
    input.content === undefined
      ? undefined
      : await evaluateEnterpriseAiContent(context, input.content);

  if (safety?.status === 'BLOCKED') {
    await writeEnterpriseAuditLog({
      action: 'ai.document.blocked',
      enterpriseId: context.enterprise.id,
      metadata: { findings: safety.findings },
      organizationId: context.organization.id,
      resource: 'ai_knowledge_document',
      userId: context.user.id,
    });
    throw new AiPlatformInputError('资料包含疑似密钥或高风险内容，已阻止进入企业知识库。');
  }

  return database.$transaction(async (transaction) => {
    const document = await transaction.aiKnowledgeDocument.create({
      data: {
        ...(input.content === undefined ? {} : { content: input.content }),
        ...(input.contentType === undefined ? {} : { contentType: input.contentType }),
        ...(input.pathname === undefined ? {} : { pathname: input.pathname }),
        ...(input.size === undefined ? {} : { size: input.size }),
        ...(input.storageProvider === undefined ? {} : { storageProvider: input.storageProvider }),
        chunkOverlap: input.chunkOverlap,
        chunkSize: input.chunkSize,
        enterpriseId: context.enterprise.id,
        ...(safety === undefined
          ? {}
          : { securityFindings: safety.findings, securityScannedAt: new Date() }),
        organizationId: context.organization.id,
        ...(input.roleKeys.length === 0
          ? {}
          : { permissions: { create: input.roleKeys.map((roleKey) => ({ roleKey })) } }),
        sourceType: input.sourceType,
        ...(safety?.status === 'REVIEW_REQUIRED'
          ? { status: AiDocumentStatus.SECURITY_REVIEW }
          : {}),
        title: input.title,
        uploadedByMembershipId: context.membership.id,
        workspaceId: input.workspaceId,
      },
    });

    if (safety?.status !== 'REVIEW_REQUIRED') {
      await transaction.aiDocumentJob.create({
        data: {
          documentId: document.id,
          enterpriseId: context.enterprise.id,
          kind: 'PROCESS_DOCUMENT',
          organizationId: context.organization.id,
          workspaceId: input.workspaceId,
        },
      });
    }

    return document;
  });
}

export async function approveSaasAiDocumentSecurityReview(
  context: SaasContext,
  documentId: string,
): Promise<void> {
  requireSaasPermission(context, saasPermissions.securityManage);
  const database = requireCmsDatabase();
  const result = await database.aiKnowledgeDocument.updateMany({
    data: { errorMessage: null, status: AiDocumentStatus.UPLOADING },
    where: {
      enterpriseId: context.enterprise.id,
      id: documentId,
      organizationId: context.organization.id,
      status: AiDocumentStatus.SECURITY_REVIEW,
    },
  });

  if (result.count === 0) {
    throw new SaasResourceNotFoundError();
  }

  await writeEnterpriseAuditLog({
    action: 'ai.document.security_review_approved',
    enterpriseId: context.enterprise.id,
    organizationId: context.organization.id,
    resource: 'ai_knowledge_document',
    resourceId: documentId,
    userId: context.user.id,
  });
}

async function recordAiDocumentSecurityOutcome(
  input: Readonly<{
    readonly context: SaasContext;
    readonly documentId: string;
    readonly findings: readonly string[];
    readonly jobId: string;
    readonly status: 'BLOCKED' | 'REVIEW_REQUIRED';
  }>,
): Promise<void> {
  const database = requireCmsDatabase();
  const reviewRequired = input.status === 'REVIEW_REQUIRED';

  await database.$transaction([
    database.aiKnowledgeDocument.update({
      data: {
        errorMessage: reviewRequired ? '文档需要企业安全管理员复核。' : '文档包含高风险内容。',
        securityFindings: input.findings,
        securityScannedAt: new Date(),
        status: reviewRequired ? AiDocumentStatus.SECURITY_REVIEW : AiDocumentStatus.FAILED,
      },
      where: { id: input.documentId },
    }),
    database.aiDocumentJob.update({
      data: {
        completedAt: new Date(),
        errorMessage: reviewRequired ? '等待安全复核。' : '高风险内容已阻止。',
        status: AiDocumentJobStatus.FAILED,
      },
      where: { id: input.jobId },
    }),
  ]);
  await writeEnterpriseAuditLog({
    action: reviewRequired ? 'ai.document.review_required' : 'ai.document.blocked',
    enterpriseId: input.context.enterprise.id,
    metadata: { findings: input.findings },
    organizationId: input.context.organization.id,
    resource: 'ai_knowledge_document',
    resourceId: input.documentId,
    userId: input.context.user.id,
  });
}

async function assertAiWorkspaceExists(context: SaasContext, workspaceId: string): Promise<void> {
  const database = requireCmsDatabase();
  const workspace = await database.aiWorkspace.findFirst({
    select: { id: true },
    where: {
      enterpriseId: context.enterprise.id,
      id: workspaceId,
      organizationId: context.organization.id,
    },
  });

  if (workspace === null) {
    throw new SaasResourceNotFoundError();
  }
}

async function resolveAiDocumentText(
  document: Readonly<{
    readonly content: string | null;
    readonly pathname: string | null;
    readonly sourceType: AiDocumentSourceType;
  }>,
): Promise<string> {
  const binary =
    document.pathname === null
      ? undefined
      : Buffer.from(
          await new Response(
            (await readPrivateAiDocumentFile(document.pathname)).stream,
          ).arrayBuffer(),
        );

  return extractDocumentText({
    ...(binary === undefined ? {} : { binary }),
    content: document.content,
    sourceType: document.sourceType,
  });
}

function getDocumentProcessingErrorMessage(error: unknown): string {
  if (error instanceof DocumentParseError || error instanceof ProjectFileStorageError) {
    return error.message;
  }

  return '文档处理失败，请检查文件后重试。';
}

function toPrismaDocumentSourceType(value: SupportedAiDocumentSourceType): AiDocumentSourceType {
  switch (value) {
    case 'DOCX':
      return AiDocumentSourceType.DOCX;
    case 'MARKDOWN':
      return AiDocumentSourceType.MARKDOWN;
    case 'PDF':
      return AiDocumentSourceType.PDF;
    case 'TEXT':
      return AiDocumentSourceType.TEXT;
  }
}
