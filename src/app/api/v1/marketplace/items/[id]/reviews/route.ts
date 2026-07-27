import { NextResponse } from 'next/server';

import { getSaasApiContext, saasApiErrorResponse } from '@/server/saas/api';
import { createMarketplaceReview } from '@/server/marketplace/creator';
import { marketplaceReviewRequestSchema } from '@/server/marketplace/validation';

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
  const parsed = marketplaceReviewRequestSchema.safeParse(
    typeof payload === 'object' && payload !== null ? { ...payload, itemId: id } : payload,
  );

  if (!parsed.success) {
    return NextResponse.json({ message: '评价内容不完整或格式不正确。' }, { status: 400 });
  }

  try {
    const review = await createMarketplaceReview(contextResult.context, parsed.data);

    return NextResponse.json({ review }, { status: 201 });
  } catch (error) {
    return saasApiErrorResponse(error);
  }
}
