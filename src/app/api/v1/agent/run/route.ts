import { NextResponse } from 'next/server';

import { getSaasApiContext, saasApiErrorResponse } from '@/server/saas/api';
import { authenticateAiApiKey } from '@/server/saas/ai-api-keys';
import { AiApiAuthenticationError } from '@/server/saas/ai-platform-errors';
import {
  queueAiOperatingSystemTask,
  queueAiOperatingSystemTaskForApiKey,
  type AiOperatingSystemTaskResult,
} from '@/server/saas/ai-operating-system';
import { aiOperatingSystemTaskRequestSchema } from '@/server/saas/ai-operating-system-validation';

export const runtime = 'nodejs';

export async function POST(request: Request): Promise<NextResponse> {
  const payload = await readJson(request);

  if (payload === undefined) {
    return NextResponse.json({ message: '请求内容无法读取。' }, { status: 400 });
  }

  const parsed = aiOperatingSystemTaskRequestSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ message: 'AIOS 任务参数不正确。' }, { status: 400 });
  }

  const sessionContext = await getSaasApiContext(request);

  try {
    switch (sessionContext.kind) {
      case 'authorized':
        return taskResultResponse(
          await queueAiOperatingSystemTask(sessionContext.context, parsed.data),
        );
      case 'unauthorized': {
        const apiKey = await authenticateAiApiKey(request);

        if (apiKey === undefined) {
          throw new AiApiAuthenticationError();
        }

        return taskResultResponse(await queueAiOperatingSystemTaskForApiKey(apiKey, parsed.data));
      }
    }
  } catch (error) {
    return saasApiErrorResponse(error);
  }
}

function taskResultResponse(result: AiOperatingSystemTaskResult): NextResponse {
  switch (result.kind) {
    case 'awaiting-approval':
      return NextResponse.json({ result }, { status: 202 });
    case 'completed':
      return NextResponse.json({ result });
  }
}

async function readJson(request: Request): Promise<unknown | undefined> {
  try {
    return await request.json();
  } catch (error) {
    if (error instanceof SyntaxError) {
      return undefined;
    }

    throw error;
  }
}
