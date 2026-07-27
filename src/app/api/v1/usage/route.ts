import { NextResponse } from 'next/server';

import { getSaasApiContext, saasApiErrorResponse } from '@/server/saas/api';
import { requireSaasPermission } from '@/server/saas/auth';
import { getOrganizationBillingSummary } from '@/server/saas/billing/summary';
import { saasPermissions } from '@/server/saas/rbac';

export const runtime = 'nodejs';

export async function GET(request: Request): Promise<NextResponse> {
  const contextResult = await getSaasApiContext(request);

  if (contextResult.kind === 'unauthorized') {
    return contextResult.response;
  }

  try {
    requireSaasPermission(contextResult.context, saasPermissions.billingManage);
    const { usage, usagePeriod } = await getOrganizationBillingSummary(contextResult.context);

    return NextResponse.json({ usage, usagePeriod });
  } catch (error) {
    return saasApiErrorResponse(error);
  }
}
