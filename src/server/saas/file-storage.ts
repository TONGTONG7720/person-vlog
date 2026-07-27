import { get, put } from '@vercel/blob';

export class ProjectFileStorageError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = 'ProjectFileStorageError';
  }
}

export function isProjectFileStorageConfigured(): boolean {
  return (process.env['BLOB_READ_WRITE_TOKEN']?.trim().length ?? 0) > 0;
}

export async function readPrivateProjectFile(pathname: string) {
  if (!isProjectFileStorageConfigured()) {
    throw new ProjectFileStorageError('Project file storage is not configured.');
  }

  const result = await get(pathname, { access: 'private' });

  if (result === null || result.stream === null) {
    throw new ProjectFileStorageError('Project file was not found.');
  }

  return result;
}

export async function readPrivateAiDocumentFile(pathname: string) {
  if (!isProjectFileStorageConfigured()) {
    throw new ProjectFileStorageError('AI document storage is not configured.');
  }

  const result = await get(pathname, { access: 'private' });

  if (result === null || result.stream === null) {
    throw new ProjectFileStorageError('AI document file was not found.');
  }

  return result;
}

export async function storePrivateProjectFile(
  input: Readonly<{
    readonly enterpriseId: string;
    readonly file: File;
    readonly organizationId: string;
    readonly projectId: string;
  }>,
): Promise<
  Readonly<{
    readonly contentType: string;
    readonly pathname: string;
    readonly size: number;
  }>
> {
  if (!isProjectFileStorageConfigured()) {
    throw new ProjectFileStorageError('Project file storage is not configured.');
  }

  const blob = await put(
    `enterprises/${input.enterpriseId}/organizations/${input.organizationId}/projects/${input.projectId}/${safeFileName(input.file.name)}`,
    input.file,
    {
      access: 'private',
      addRandomSuffix: true,
      contentType: input.file.type,
    },
  );

  return { contentType: input.file.type, pathname: blob.pathname, size: input.file.size };
}

export async function storePrivateAiDocumentFile(
  input: Readonly<{
    readonly enterpriseId: string;
    readonly file: File;
    readonly organizationId: string;
    readonly workspaceId: string;
  }>,
): Promise<
  Readonly<{
    readonly contentType: string;
    readonly pathname: string;
    readonly size: number;
  }>
> {
  if (!isProjectFileStorageConfigured()) {
    throw new ProjectFileStorageError('AI document storage is not configured.');
  }

  const blob = await put(
    `enterprises/${input.enterpriseId}/organizations/${input.organizationId}/ai-workspaces/${input.workspaceId}/${safeFileName(input.file.name)}`,
    input.file,
    {
      access: 'private',
      addRandomSuffix: true,
      contentType: input.file.type,
    },
  );

  return { contentType: input.file.type, pathname: blob.pathname, size: input.file.size };
}

function safeFileName(value: string): string {
  const normalized = value.trim().replaceAll(/[^a-zA-Z0-9._-]+/gu, '-');

  return normalized === '' ? 'project-file' : normalized.slice(0, 160);
}
