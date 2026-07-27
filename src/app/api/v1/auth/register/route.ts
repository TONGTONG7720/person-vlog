import { NextResponse } from 'next/server';

import { registerSaasAccount } from '@/server/saas/registration';

export const runtime = 'nodejs';

export async function POST(request: Request): Promise<NextResponse> {
  if (!request.headers.get('content-type')?.includes('application/json')) {
    return NextResponse.json({ message: '请求格式不正确。' }, { status: 415 });
  }

  let payload: unknown;

  try {
    payload = await request.json();
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json({ message: '请求内容无法读取。' }, { status: 400 });
    }

    throw error;
  }

  const result = await registerSaasAccount(payload);

  switch (result.kind) {
    case 'created':
      return NextResponse.json(
        { organizationSlug: result.organizationSlug, userId: result.userId },
        { status: 201 },
      );
    case 'configuration-unavailable':
      return NextResponse.json({ message: '账户系统尚未完成配置。' }, { status: 503 });
    case 'email-taken':
      return NextResponse.json({ message: '该邮箱已经注册。' }, { status: 409 });
    case 'invalid':
      return NextResponse.json({ message: '请检查邮箱、密码和企业名称。' }, { status: 400 });
  }
}
