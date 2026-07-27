import { NextResponse } from 'next/server';

import { contentWriterRequestSchema } from '@/ai/lib/content-writer-validation';
import { getAssistantModelConfiguration } from '@/ai/model-config';
import { AssistantModelError, streamAssistantModel } from '@/ai/model-stream';
import { buildContentWriterPrompt } from '@/ai/prompts/content';
import { encodeTextStream } from '@/ai/stream';
import { getAdminSession } from '@/server/cms/auth';

export const runtime = 'nodejs';

const contentWriterFailureMessage = '暂时无法生成草稿。请检查模型配置后重试，或继续手动编辑。';

export async function POST(request: Request): Promise<Response> {
  const session = await getAdminSession();

  if (session === undefined) {
    return NextResponse.json({ message: '未授权访问。' }, { status: 401 });
  }

  if (!request.headers.get('content-type')?.includes('application/json')) {
    return NextResponse.json({ message: contentWriterFailureMessage }, { status: 415 });
  }

  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ message: contentWriterFailureMessage }, { status: 400 });
  }

  const parsed = contentWriterRequestSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ message: contentWriterFailureMessage }, { status: 400 });
  }

  const modelConfiguration = getAssistantModelConfiguration();

  if (modelConfiguration.kind === 'disabled') {
    return NextResponse.json({ message: contentWriterFailureMessage }, { status: 503 });
  }

  try {
    const source = await streamAssistantModel(modelConfiguration, {
      maxTokens: 700,
      messages: [{ content: '请按内容工作台规则完成本次草稿任务。', role: 'user' }],
      systemPrompt: buildContentWriterPrompt(parsed.data),
    });

    return new Response(encodeTextStream(source), {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
        'Content-Type': 'text/plain; charset=utf-8',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error) {
    if (
      error instanceof AssistantModelError ||
      error instanceof DOMException ||
      error instanceof TypeError
    ) {
      return NextResponse.json({ message: contentWriterFailureMessage }, { status: 502 });
    }

    throw error;
  }
}
