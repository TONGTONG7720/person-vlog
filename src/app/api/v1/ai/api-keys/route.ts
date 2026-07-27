import { NextResponse } from 'next/server';

import { getSaasApiContext, saasApiErrorResponse } from '@/server/saas/api';
import { createSaasAiApiKey, getSaasAiApiKeys } from '@/server/saas/ai-api-keys';
import { createAiApiKeyRequestSchema } from '@/server/saas/validation';

export const runtime = 'nodejs';

export async function GET(request: Request): Promise<NextResponse> {
  const contextResult = await getSaasApiContext(request);

  if (contextResult.kind === 'unauthorized') {
    return contextResult.response;
  }

  try {
    const apiKeys = await getSaasAiApiKeys(contextResult.context);

    return NextResponse.json({ apiKeys });
  } catch (error) {
    return saasApiErrorResponse(error);
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  const contextResult = await getSaasApiContext(request);

  if (contextResult.kind === 'unauthorized') {
    return contextResult.response;
  }

  const payload = await readJson(request);

  if (payload === undefined) {
    return NextResponse.json({ message: '请求内容无法读取。' }, { status: 400 });
  }

  const parsed = createAiApiKeyRequestSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ message: 'API Key 名称不正确。' }, { status: 400 });
  }

  try {
    const apiKey = await createSaasAiApiKey(contextResult.context, {
      ...(parsed.data.expiresAt === undefined ? {} : { expiresAt: parsed.data.expiresAt }),
      name: parsed.data.name,
      scopes: parsed.data.scopes,
    });

    return NextResponse.json({ apiKey }, { status: 201 });
  } catch (error) {
    return saasApiErrorResponse(error);
  }
}

async function readJson(request: Request): Promise<unknown | undefined> {
  try {
    return await request.json();
  } catch (error) {
    return error instanceof SyntaxError ? undefined : Promise.reject(error);
  }
}
