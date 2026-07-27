import { NextResponse } from 'next/server';

import { env } from '@/config/env';
import { getSaasApiContext, saasApiErrorResponse } from '@/server/saas/api';
import { requireSaasPermission } from '@/server/saas/auth';
import { BillingStateMappingError } from '@/server/saas/billing/billing-errors';
import {
  createStripeCheckoutSession,
  scheduleStripeSubscriptionCancellation,
} from '@/server/saas/billing/checkout';
import { saasPermissions } from '@/server/saas/rbac';
import { subscriptionChangeRequestSchema } from '@/server/saas/validation';

export const runtime = 'nodejs';

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
      return NextResponse.json({ message: '订阅请求内容无法读取。' }, { status: 400 });
    }

    throw error;
  }

  const parsed = subscriptionChangeRequestSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ message: '订阅操作不正确。' }, { status: 400 });
  }

  try {
    requireSaasPermission(contextResult.context, saasPermissions.billingManage);

    switch (parsed.data.action) {
      case 'cancel':
        await scheduleStripeSubscriptionCancellation(contextResult.context);

        return NextResponse.json({ kind: 'cancellation-scheduled' });
      case 'checkout': {
        const checkout = await createStripeCheckoutSession({
          context: contextResult.context,
          origin: env.siteUrl,
          planSlug: parsed.data.planSlug,
        });

        return NextResponse.json({ kind: 'checkout', url: checkout.url });
      }
      default:
        return assertNever(parsed.data);
    }
  } catch (error) {
    return saasApiErrorResponse(error);
  }
}

function assertNever(value: never): never {
  throw new BillingStateMappingError(String(value));
}
