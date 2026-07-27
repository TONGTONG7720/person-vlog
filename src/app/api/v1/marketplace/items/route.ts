import { NextResponse } from 'next/server';

import { getSaasApiContext, saasApiErrorResponse } from '@/server/saas/api';
import { createMarketplaceItem } from '@/server/marketplace/creator';
import { getPublicMarketplaceCatalog } from '@/server/marketplace/public-catalog';
import {
  createMarketplaceItemRequestSchema,
  marketplaceItemTypeValues,
} from '@/server/marketplace/validation';

export const runtime = 'nodejs';

export async function GET(request: Request): Promise<NextResponse> {
  const parameters = new URL(request.url).searchParams;
  const typeValue = parameters.get('type');
  const type = marketplaceItemTypeValues.find((item) => item === typeValue);
  const pageValue = Number(parameters.get('page') ?? '1');
  const category = parameters.get('category');
  const search = parameters.get('search');
  const catalog = await getPublicMarketplaceCatalog({
    ...(category === null || category === '' ? {} : { category }),
    page: Number.isFinite(pageValue) ? pageValue : 1,
    ...(search === null || search === '' ? {} : { search }),
    ...(type === undefined ? {} : { type }),
  });

  return NextResponse.json(catalog, {
    headers: { 'Cache-Control': 'public, max-age=30, s-maxage=60' },
  });
}

export async function POST(request: Request): Promise<NextResponse> {
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

  const parsed = createMarketplaceItemRequestSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ message: '发布资料不完整或格式不正确。' }, { status: 400 });
  }

  try {
    const item = await createMarketplaceItem(contextResult.context, parsed.data);

    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    return saasApiErrorResponse(error);
  }
}
