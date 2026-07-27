import { NextResponse } from 'next/server';

import { getSaasApiContext, saasApiErrorResponse } from '@/server/saas/api';
import { submitMarketplaceItemForReview } from '@/server/marketplace/creator';
import { marketplaceItemIdRequestSchema } from '@/server/marketplace/validation';

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

  const { id } = await routeContext.params;
  const parsed = marketplaceItemIdRequestSchema.safeParse({ itemId: id });

  if (!parsed.success) {
    return NextResponse.json({ message: '发布条目不存在。' }, { status: 400 });
  }

  try {
    const item = await submitMarketplaceItemForReview(contextResult.context, parsed.data.itemId);

    return NextResponse.json({ item });
  } catch (error) {
    return saasApiErrorResponse(error);
  }
}
