import { NextResponse } from 'next/server';

import { getSaasApiContext, saasApiErrorResponse } from '@/server/saas/api';
import { resolveAiOperatingSystemApproval } from '@/server/saas/ai-operating-system';
import {
  aiOperatingSystemApprovalDecisionSchema,
  aiOperatingSystemApprovalIdSchema,
} from '@/server/saas/ai-operating-system-validation';

export const runtime = 'nodejs';

type ApprovalRouteContext = Readonly<{
  readonly params: Promise<Readonly<{ readonly approvalId: string }>>;
}>;

export async function POST(
  request: Request,
  routeContext: ApprovalRouteContext,
): Promise<NextResponse> {
  const contextResult = await getSaasApiContext(request);

  if (contextResult.kind === 'unauthorized') {
    return contextResult.response;
  }

  const { approvalId } = await routeContext.params;
  const parsedApprovalId = aiOperatingSystemApprovalIdSchema.safeParse(approvalId);
  const payload = await readJson(request);
  const parsedDecision = aiOperatingSystemApprovalDecisionSchema.safeParse(payload);

  if (!parsedApprovalId.success || !parsedDecision.success) {
    return NextResponse.json({ message: '审批参数不正确。' }, { status: 400 });
  }

  try {
    const result = await resolveAiOperatingSystemApproval(contextResult.context, {
      approvalId: parsedApprovalId.data,
      decision: parsedDecision.data.decision,
    });

    return NextResponse.json({ result });
  } catch (error) {
    return saasApiErrorResponse(error);
  }
}

async function readJson(request: Request): Promise<unknown | undefined> {
  try {
    return await request.json();
  } catch (error) {
    if (error instanceof SyntaxError) {
      return undefined;
    }

    throw error;
  }
}
