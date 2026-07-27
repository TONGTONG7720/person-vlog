import { NextResponse } from 'next/server';

import { getSaasApiContext, saasApiErrorResponse } from '@/server/saas/api';
import type { SaasContext } from '@/server/saas/auth';
import {
  createSaasAiFileDocument,
  createSaasAiTextDocument,
  getSaasAiDocuments,
} from '@/server/saas/ai-document-jobs';
import { aiWorkspaceRoleKeys, createAiTextDocumentRequestSchema } from '@/server/saas/validation';

const maximumAiDocumentSize = 20 * 1024 * 1024;

export const runtime = 'nodejs';

export async function GET(request: Request): Promise<NextResponse> {
  const contextResult = await getSaasApiContext(request);

  if (contextResult.kind === 'unauthorized') {
    return contextResult.response;
  }

  const workspaceId = new URL(request.url).searchParams.get('workspaceId') ?? undefined;

  try {
    const documents = await getSaasAiDocuments(contextResult.context, workspaceId);

    return NextResponse.json({ documents });
  } catch (error) {
    return saasApiErrorResponse(error);
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  const contextResult = await getSaasApiContext(request);

  if (contextResult.kind === 'unauthorized') {
    return contextResult.response;
  }

  if (request.headers.get('content-type')?.startsWith('multipart/form-data') === true) {
    return createFileDocumentResponse(request, contextResult.context);
  }

  const payload = await readJson(request);

  if (payload === undefined) {
    return NextResponse.json({ message: '请求内容无法读取。' }, { status: 400 });
  }

  const parsed = createAiTextDocumentRequestSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ message: '知识文档内容或分块配置不正确。' }, { status: 400 });
  }

  try {
    const document = await createSaasAiTextDocument(contextResult.context, parsed.data);

    return NextResponse.json(
      { document, next: 'POST /api/v1/ai/documents/:id/process' },
      { status: 202 },
    );
  } catch (error) {
    return saasApiErrorResponse(error);
  }
}

async function createFileDocumentResponse(
  request: Request,
  context: SaasContext,
): Promise<NextResponse> {
  let formData: FormData;

  try {
    formData = await request.formData();
  } catch (error) {
    return error instanceof TypeError
      ? NextResponse.json({ message: '文件上传内容无法读取。' }, { status: 400 })
      : Promise.reject(error);
  }

  const file = formData.get('file');
  const workspaceId = getFormText(formData, 'workspaceId');
  const title = getFormText(formData, 'title') || (file instanceof File ? file.name : '');
  const chunkSize = getFormNumber(formData, 'chunkSize', 800);
  const chunkOverlap = getFormNumber(formData, 'chunkOverlap', 120);
  const roleKeys = getRoleKeys(getFormText(formData, 'roleKeys'));
  const sourceType = file instanceof File ? getAiFileSourceType(file) : undefined;

  if (
    !(file instanceof File) ||
    workspaceId === '' ||
    title.trim().length < 2 ||
    file.size <= 0 ||
    file.size > maximumAiDocumentSize ||
    sourceType === undefined ||
    chunkSize < 200 ||
    chunkSize > 2_000 ||
    chunkOverlap < 0 ||
    chunkOverlap > 800 ||
    roleKeys === undefined
  ) {
    return NextResponse.json(
      { message: '仅支持 20 MB 以内的 PDF、Markdown、TXT 或 DOCX 文件。' },
      { status: 400 },
    );
  }

  try {
    const document = await createSaasAiFileDocument(context, {
      chunkOverlap,
      chunkSize,
      file,
      roleKeys,
      sourceType,
      title: title.trim(),
      workspaceId,
    });

    return NextResponse.json(
      { document, next: 'POST /api/v1/ai/documents/:id/process' },
      { status: 202 },
    );
  } catch (error) {
    return saasApiErrorResponse(error);
  }
}

function getAiFileSourceType(file: File): 'DOCX' | 'MARKDOWN' | 'PDF' | 'TEXT' | undefined {
  const fileName = file.name.toLocaleLowerCase('en-US');

  if (file.type === 'application/pdf' || fileName.endsWith('.pdf')) {
    return 'PDF';
  }

  if (
    file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    fileName.endsWith('.docx')
  ) {
    return 'DOCX';
  }

  if (file.type === 'text/markdown' || fileName.endsWith('.md') || fileName.endsWith('.mdx')) {
    return 'MARKDOWN';
  }

  return file.type === 'text/plain' || fileName.endsWith('.txt') ? 'TEXT' : undefined;
}

function getFormNumber(formData: FormData, name: string, fallback: number): number {
  const value = getFormText(formData, name);

  return value === '' ? fallback : Number(value);
}

function getFormText(formData: FormData, name: string): string {
  const value = formData.get(name);

  return typeof value === 'string' ? value.trim() : '';
}

function getRoleKeys(value: string): readonly string[] | undefined {
  if (value === '') {
    return [];
  }

  const roleKeys = value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  return roleKeys.every((roleKey) => aiWorkspaceRoleKeys.includes(roleKey as never))
    ? [...new Set(roleKeys)]
    : undefined;
}

async function readJson(request: Request): Promise<unknown | undefined> {
  try {
    return await request.json();
  } catch (error) {
    return error instanceof SyntaxError ? undefined : Promise.reject(error);
  }
}
