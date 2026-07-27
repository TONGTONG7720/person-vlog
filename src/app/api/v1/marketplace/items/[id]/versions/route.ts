import { NextResponse } from 'next/server';

import { getSaasApiContext, saasApiErrorResponse } from '@/server/saas/api';
import { createMarketplaceItemVersion } from '@/server/marketplace/creator';
import {
  marketplaceItemIdRequestSchema,
  marketplaceItemVersionRequestSchema,
} from '@/server/marketplace/validation';

export const runtime = 'nodejs';

type ItemRouteContext = Readonly<{ readonly params: Promise<Readonly<{ readonly id: string }>> }>;

export async function POST(
  request: Request,
  routeContext: ItemRouteContext,
): Promise<NextResponse> {
  const contextResult = await getSaasApiContext(request);

  if (contextResult.kind === 'unauthorized') {
    return contextResult.response;
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

  const { id } = await routeContext.params;
  const item = marketplaceItemIdRequestSchema.safeParse({ itemId: id });
  const version = marketplaceItemVersionRequestSchema.safeParse(payload);

  if (!item.success || !version.success) {
    return NextResponse.json({ message: '版本发布资料不完整或格式不正确。' }, { status: 400 });
  }

  try {
    const result = await createMarketplaceItemVersion(
      contextResult.context,
      item.data.itemId,
      version.data,
    );

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return saasApiErrorResponse(error);
  }
}
