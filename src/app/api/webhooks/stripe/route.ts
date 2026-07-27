import Stripe from 'stripe';
import { NextResponse } from 'next/server';

import { BillingConfigurationError } from '@/server/saas/billing/billing-errors';
import { constructStripeWebhookEvent } from '@/server/saas/billing/stripe-client';
import { handleStripeWebhook } from '@/server/saas/billing/stripe-webhook';

export const runtime = 'nodejs';

export async function POST(request: Request): Promise<NextResponse> {
  const signature = request.headers.get('stripe-signature');

  if (signature === null) {
    return NextResponse.json({ message: '缺少支付签名。' }, { status: 400 });
  }

  try {
    const payload = await request.text();
    const event = constructStripeWebhookEvent(payload, signature);
    const result = await handleStripeWebhook(event);

    return NextResponse.json({ received: true, result });
  } catch (error) {
    if (error instanceof BillingConfigurationError) {
      return NextResponse.json({ message: '账单 Webhook 尚未配置。' }, { status: 503 });
    }

    if (error instanceof Stripe.errors.StripeSignatureVerificationError) {
      return NextResponse.json({ message: '支付签名无效。' }, { status: 400 });
    }

    return NextResponse.json({ message: '暂时无法处理支付通知。' }, { status: 500 });
  }
}
