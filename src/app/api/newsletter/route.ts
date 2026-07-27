import { NextResponse } from 'next/server';
import { z } from 'zod';

import { getCmsDatabase } from '@/server/cms/database';

const newsletterMessages = {
  'en-US': {
    invalidEmail: 'Enter a valid email address.',
    invalidPayload: 'The submission format is invalid.',
    success:
      'You are registered. This records your interest only; it does not send email automatically.',
    unavailable: 'Newsletter registration is not available yet. Please try again later.',
  },
  'zh-CN': {
    invalidEmail: '请填写有效的邮箱地址。',
    invalidPayload: '提交格式无效。',
    success: '已登记。当前只保存订阅意向，不会自动发送邮件。',
    unavailable: '订阅登记暂未开放，请稍后再试。',
  },
} as const;

const newsletterRequestSchema = z
  .object({
    email: z.string().trim().email().max(254),
    locale: z.enum(['zh-CN', 'en-US']).default('zh-CN'),
    source: z.enum(['blog', 'footer']).default('footer'),
  })
  .strict();

export async function POST(request: Request): Promise<Response> {
  if (!request.headers.get('content-type')?.includes('application/json')) {
    return NextResponse.json(
      { message: newsletterMessages['zh-CN'].invalidPayload },
      { status: 415 },
    );
  }

  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { message: newsletterMessages['zh-CN'].invalidPayload },
      { status: 400 },
    );
  }

  const parsed = newsletterRequestSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { message: newsletterMessages['zh-CN'].invalidEmail },
      { status: 400 },
    );
  }

  const messages = newsletterMessages[parsed.data.locale];

  const database = getCmsDatabase();

  if (database === undefined) {
    return NextResponse.json({ message: messages.unavailable }, { status: 503 });
  }

  await database.newsletter.upsert({
    create: {
      email: parsed.data.email.toLocaleLowerCase('en-US'),
      source: parsed.data.source,
      status: 'pending',
    },
    update: {
      source: parsed.data.source,
      status: 'pending',
    },
    where: { email: parsed.data.email.toLocaleLowerCase('en-US') },
  });

  return NextResponse.json({ message: messages.success }, { status: 201 });
}
