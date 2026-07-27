import { NextResponse } from 'next/server';

import { getEnterpriseSsoDiscovery } from '@/server/enterprise/sso-service';

export const runtime = 'nodejs';

export async function GET(request: Request): Promise<NextResponse> {
  const domain = new URL(request.url).searchParams.get('domain');

  if (domain === null) {
    return NextResponse.json({ message: '请提供企业邮箱域名。' }, { status: 400 });
  }

  const discovery = await getEnterpriseSsoDiscovery(domain);

  return discovery === undefined
    ? NextResponse.json({ message: '该域名没有可用的企业 SSO 配置。' }, { status: 404 })
    : NextResponse.json({ discovery });
}
